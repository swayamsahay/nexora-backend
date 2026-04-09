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
      store: {
        name: String,
        description: String,
        theme: String,
        category: String,
        logo: {
          type: String,
          default: null,
        },
      },
      layout: {
        sections: [String],
      },
      products: [
        {
          name: String,
          price: Number,
          description: String,
          category: String,
          image: {
            type: String,
            default: null,
          },
        },
      ],
      pages: [String],
      features: [String],
    },
    customizations: {
      type: Map,
      of: String,
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
