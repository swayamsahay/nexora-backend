import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";

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
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]?.trim());

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
}

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use("/api/order/webhook", express.raw({ type: "application/json" }));
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan(":method :url :status :response-time ms"));

app.use("/api", apiRateLimiter);
app.use((req, res, next) => {
  if (
    req.originalUrl.startsWith("/api/order/webhook") ||
    req.originalUrl.startsWith("/api/orders/webhook")
  ) {
    return next();
  }

  return sanitizeInput(req, res, next);
});

app.use("/api/auth", authRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/product", productRoutes);
app.use("/api/products", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/builder", builderRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server running" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server running" });
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Shutting down...`);

      server.close(async () => {
        await mongoose.connection.close(false);
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

void startServer();