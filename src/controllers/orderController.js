import {
  cancelOrderForUser,
  createOrderForUser,
  createRazorpayOrderForUser,
  getOrdersForUser,
  processWebhookEvent,
  verifyPaymentForUser,
} from "../services/orderService.js";
import { verifyRazorpayWebhookSignature } from "../utils/razorpay.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const createOrder = asyncHandler(async (req, res) => {
  console.log("[ORDER] Create order request", {
    userId: req.user?.id,
    productId: req.body?.productId,
    quantity: req.body?.quantity,
  });

  const order = await createOrderForUser(req.user.id, req.body);
  return sendSuccess(res, 201, { order }, "Order created successfully.");
});

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { localOrderId } = req.body;
  const data = await createRazorpayOrderForUser(req.user.id, localOrderId);
  return sendSuccess(res, 200, data);
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const order = await verifyPaymentForUser(req.user.id, req.body);
  return sendSuccess(res, 200, { order }, "Payment verified successfully.");
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await cancelOrderForUser(req.user.id, req.params.orderId);
  return sendSuccess(res, 200, { order }, "Order cancelled successfully.");
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const data = await getOrdersForUser(req.user.id, {
    page: req.query.page,
    limit: req.query.limit,
  });
  return sendSuccess(res, 200, data);
});

export const handleWebhook = async (req, res) => {
  try {
    console.log("[PAYMENT] Razorpay webhook received", {
      path: req.originalUrl,
    });

    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body;

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature." });
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    const result = await processWebhookEvent(event);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Webhook handling failed." });
  }
};