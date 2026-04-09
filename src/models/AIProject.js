import mongoose from "mongoose";

const aiProjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    detectedCategory: {
      type: String,
      enum: ["clothing", "food", "tech", "services", "health", "education", "other"],
      required: true,
    },
    detectedTheme: {
      type: String,
      enum: ["modern", "minimal", "luxury", "dark", "vibrant"],
      default: "modern",
    },
    generatedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    customizations: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AIProject", aiProjectSchema);
