import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Store from "../models/Store.js";
import { createError } from "../utils/apiResponse.js";

export const getOwnerAnalytics = async (userId) => {
  const store = await Store.findOne({ userId });
  if (!store) {
    throw createError("Store not found for this user.", 404);
  }

  const [totalOrders, revenueResult, productCount] = await Promise.all([
    Order.countDocuments({ storeId: store._id }),
    Order.aggregate([
      {
        $match: {
          storeId: store._id,
          status: { $in: ["paid", "shipped", "delivered"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]),
    Product.countDocuments({ storeId: store._id }),
  ]);

  return {
    storeId: store._id,
    totalOrders,
    totalRevenue: revenueResult[0]?.totalRevenue || 0,
    productCount,
  };
};