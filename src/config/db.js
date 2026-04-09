import mongoose from "mongoose";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async ({ maxRetries = 3, baseDelayMs = 1000 } = {}) => {
  const mongoUri = process.env.MONGO_URI;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
      }

      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log(`MongoDB connected on attempt ${attempt}`);
      return mongoose.connection;
    } catch (error) {
      console.error(`MongoDB connection failed on attempt ${attempt}/${maxRetries}: ${error.message}`);

      if (attempt === maxRetries) {
        throw error;
      }

      await sleep(baseDelayMs * attempt);
    }
  }

  throw new Error("MongoDB connection failed.");
};

export default connectDB;