import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import builderRoutes from "./routes/builderRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

// Middleware
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { sanitizeInput } from "./middleware/sanitizeInput.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

dotenv.config();

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
}

// Connect DB
connectDB();

const app = express();

// Keep webhook payload as raw bytes for signature verification.
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));

// ✅ CORS (IMPORTANT FIX)
app.use(
  cors({
    origin: "https://nexora-frontend-sigma.vercel.app",
    credentials: true,
  })
);

// ✅ Body parser (MUST be before routes)
app.use(express.json());

// ✅ Security / Logging
app.use(morgan("dev"));
app.use(apiRateLimiter);
app.use(sanitizeInput);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/builder", builderRoutes);
app.use("/api/ai", aiRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Nexora Backend Running 🚀");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// ✅ Error handling
app.use(notFound);
app.use(errorHandler);

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});