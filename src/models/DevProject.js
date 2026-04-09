import mongoose from "mongoose";

const devProjectSchema = new mongoose.Schema(
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
    frontendCode: {
      pages: {
        type: [
          {
            name: String,
            path: String,
            sections: [String],
            components: [String],
          },
        ],
        default: [],
      },
      components: {
        type: [
          {
            name: String,
            type: String,
            props: mongoose.Schema.Types.Mixed,
          },
        ],
        default: [],
      },
      globalStyles: {
        type: Map,
        of: String,
        default: {},
      },
    },
    backendRoutes: {
      publicRoutes: {
        type: [
          {
            path: String,
            method: String,
            handler: String,
            description: String,
          },
        ],
        default: [],
      },
      protectedRoutes: {
        type: [
          {
            path: String,
            method: String,
            handler: String,
            description: String,
            auth: String,
          },
        ],
        default: [],
      },
      webhooks: {
        type: [
          {
            name: String,
            path: String,
            triggers: [String],
            handler: String,
          },
        ],
        default: [],
      },
    },
    databaseSchema: {
      collections: {
        type: [
          {
            name: String,
            type: String,
            fields: [
              {
                name: String,
                type: String,
                required: Boolean,
                indexed: Boolean,
              },
            ],
            indexes: [String],
          },
        ],
        default: [],
      },
      relationships: {
        type: [
          {
            from: String,
            to: String,
            type: String,
          },
        ],
        default: [],
      },
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
    lastSynced: {
      type: Date,
      default: Date.now,
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

// Prevent dev data from exceeding limits
devProjectSchema.pre("save", function (next) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const dataSize = JSON.stringify(this).length;

  if (dataSize > maxSize) {
    return next(new Error("Dev project data exceeds maximum size limit (10MB)"));
  }

  next();
});

export default mongoose.model("DevProject", devProjectSchema);
