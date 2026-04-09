import express from "express";
import {
  cancelOrder,
  createOrder,
  createRazorpayOrder,
  getMyOrders,
  handleWebhook,
  verifyPayment,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/webhook", handleWebhook);

router.post("/", protect, createOrder);
router.get("/me", protect, getMyOrders);
router.patch("/:orderId/cancel", protect, cancelOrder);
router.post("/create-razorpay-order", protect, createRazorpayOrder);
router.post("/verify-payment", protect, verifyPayment);

export default router;