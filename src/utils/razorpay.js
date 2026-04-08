import crypto from "node:crypto";
import Razorpay from "razorpay";

export const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const error = new Error("Razorpay keys are not configured.");
    error.statusCode = 500;
    throw error;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const verifyRazorpayPaymentSignature = ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return false;
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expected === razorpaySignature;
};

export const verifyRazorpayWebhookSignature = (rawBody, webhookSignature) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET || !webhookSignature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return expected === webhookSignature;
};