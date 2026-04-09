import mongoose from "mongoose";

const builderProjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    layout: {
      sections: {
        type: [String],
        default: [],
      },
      theme: {
        type: String,
        enum: ["modern", "minimal", "luxury", "dark", "vibrant"],
        default: "modern",
      },
      styles: {
        type: Map,
        of: String,
        default: {},
      },
    },
    components: {
      type: [
        {
          id: String,
          type: String,
          name: String,
          props: mongoose.Schema.Types.Mixed,
          children: [String],
        },
      ],
      default: [],
    },
    pages: {
      type: [
        {
          id: String,
          name: String,
          slug: String,
          sections: [String],
          metadata: mongoose.Schema.Types.Mixed,
        },
      ],
      default: [],
    },
    versions: {
      type: [
        {
          timestamp: Date,
          label: String,
          data: mongoose.Schema.Types.Mixed,
        },
      ],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
        message: "Maximum 10 versions allowed",
      },
    },
    currentVersion: {
      type: Number,
      default: 0,
    },
    metadata: {
      description: String,
      tags: [String],
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

// Prevent builder data from exceeding limits
builderProjectSchema.pre("save", function (next) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const dataSize = JSON.stringify(this).length;

  if (dataSize > maxSize) {
    return next(new Error("Builder data exceeds maximum size limit (5MB)"));
  }

  next();
});

export default mongoose.model("BuilderProject", builderProjectSchema);
