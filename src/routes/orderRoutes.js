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
import { sanitizeInput } from "../middleware/sanitizeInput.js";

const router = express.Router();

// Webhook needs raw body so the signature can be verified exactly.
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

router.use(express.json());
router.use(sanitizeInput);

router.post("/", protect, createOrder);
router.get("/me", protect, getMyOrders);
router.patch("/:orderId/cancel", protect, cancelOrder);
router.post("/create-razorpay-order", protect, createRazorpayOrder);
router.post("/verify-payment", protect, verifyPayment);

export default router;