import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { getRazorpayClient, verifyRazorpayPaymentSignature } from "../utils/razorpay.js";
import { createError } from "../utils/apiResponse.js";

const toOrderResponse = (order) => ({
  id: order._id,
  productId: order.productId,
  storeId: order.storeId,
  userId: order.userId,
  items: order.items,
  quantity: order.quantity,
  unitPrice: order.unitPrice,
  totalAmount: order.totalAmount,
  total: order.total,
  status: order.status,
  paymentId: order.paymentId,
  razorpayOrderId: order.razorpayOrderId,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const markOrderPaidAndUpdateStock = async (order, paymentId) => {
  if (order.status === "paid") {
    return order;
  }

  if (order.paymentProcessedAt) {
    return order;
  }

  const product = await Product.findById(order.productId);
  if (!product) {
    throw createError("Product not found for this order.", 404);
  }

  if (product.stock < order.quantity) {
    throw createError("Product is out of stock for this order.", 400);
  }

  // Prevent payment on stale orders when product price has changed after order creation.
  if (Number(product.price) !== Number(order.unitPrice)) {
    throw createError("Product price changed. Please create a new order.", 409);
  }

  product.stock -= order.quantity;
  if (product.stock === 0) {
    product.isAvailable = false;
  }
  await product.save();

  order.status = "paid";
  order.paymentId = paymentId;
  order.paymentProcessedAt = new Date();
  await order.save();

  return order;
};

export const createOrderForUser = async (userId, payload) => {
  const { productId, quantity } = payload;

  if (!productId) {
    throw createError("productId is required.", 400);
  }

  if (!quantity || Number.isNaN(Number(quantity)) || Number(quantity) < 1) {
    throw createError("Quantity must be at least 1.", 400);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw createError("Product not found.", 404);
  }

  if (!product.isAvailable) {
    throw createError("Product is not available.", 400);
  }

  const quantityNumber = Number(quantity);
  if (product.stock < quantityNumber) {
    throw createError("Insufficient stock.", 400);
  }

  const unitPrice = Number(product.price);
  const totalAmount = Number((unitPrice * quantityNumber).toFixed(2));

  const order = await Order.create({
    productId: product._id,
    storeId: product.storeId,
    userId,
    items: [
      {
        productId: product._id,
        quantity: quantityNumber,
        unitPrice,
      },
    ],
    quantity: quantityNumber,
    unitPrice,
    totalAmount,
    total: totalAmount,
  });

  return toOrderResponse(order);
};

export const createRazorpayOrderForUser = async (userId, localOrderId) => {
  if (!localOrderId) {
    throw createError("Local order ID is required.", 400);
  }

  const order = await Order.findById(localOrderId);
  if (!order) {
    throw createError("Order not found.", 404);
  }

  if (order.userId.toString() !== userId.toString()) {
    throw createError("You are not allowed to pay for this order.", 403);
  }

  if (order.status !== "pending") {
    throw createError("Only pending orders can be paid.", 400);
  }

  const product = await Product.findById(order.productId);
  if (!product) {
    throw createError("Product not found for this order.", 404);
  }

  if (Number(product.price) !== Number(order.unitPrice)) {
    throw createError("Product price changed. Please create a new order.", 409);
  }

  const razorpay = getRazorpayClient();
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: `nexora_${order._id.toString()}`,
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return {
    order: toOrderResponse(order),
    razorpayOrder,
  };
};

export const verifyPaymentForUser = async (userId, payload) => {
  const { localOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

  if (!localOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw createError("Payment verification fields are required.", 400);
  }

  const order = await Order.findById(localOrderId);
  if (!order) {
    throw createError("Order not found.", 404);
  }

  if (order.userId.toString() !== userId.toString()) {
    throw createError("You are not allowed to verify this payment.", 403);
  }

  if (order.status === "paid" || order.paymentProcessedAt) {
    return toOrderResponse(order);
  }

  if (order.razorpayOrderId !== razorpay_order_id) {
    throw createError("Razorpay order ID does not match.", 400);
  }

  const isValid = verifyRazorpayPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  if (!isValid) {
    throw createError("Invalid payment signature.", 400);
  }

  const updated = await markOrderPaidAndUpdateStock(order, razorpay_payment_id);
  return toOrderResponse(updated);
};

export const processWebhookEvent = async (event) => {
  if (!event?.event || !event?.payload?.payment?.entity) {
    return { message: "Unsupported webhook payload." };
  }

  const payment = event.payload.payment.entity;
  const razorpayOrderId = payment.order_id;
  const paymentId = payment.id;

  if (!razorpayOrderId) {
    return { message: "Webhook does not include order reference." };
  }

  const order = await Order.findOne({ razorpayOrderId });
  if (!order) {
    return { message: "Local order not found for webhook." };
  }

  if (event.event === "payment.captured") {
    if (order.status === "paid" || order.paymentProcessedAt) {
      return { message: "Payment already processed." };
    }

    await markOrderPaidAndUpdateStock(order, paymentId || "");
    return { message: "Payment captured. Order marked as paid." };
  }

  if (event.event === "payment.failed") {
    order.paymentId = paymentId || "";
    await order.save();
    return { message: "Payment failed. Order remains pending." };
  }

  return { message: `Webhook ${event.event} received.` };
};

export const cancelOrderForUser = async (userId, orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw createError("Order not found.", 404);
  }

  if (order.userId.toString() !== userId.toString()) {
    throw createError("You are not allowed to cancel this order.", 403);
  }

  if (order.status !== "pending") {
    throw createError("Only pending orders can be cancelled.", 400);
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  await order.save();

  return toOrderResponse(order);
};

export const getOrdersForUser = async (userId, options = {}) => {
  const page = Number(options.page) > 0 ? Number(options.page) : 1;
  const limit = Number(options.limit) > 0 ? Math.min(Number(options.limit), 100) : 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments({ userId }),
  ]);

  return {
    items: orders.map(toOrderResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};