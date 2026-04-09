import mongoose from "mongoose";

const vector3Schema = {
  type: [Number],
  default: [0, 0, 0],
  validate: {
    validator(value) {
      return Array.isArray(value) && value.length === 3;
    },
    message: "Vector values must contain exactly 3 numbers.",
  },
};

const animationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["rotate", "float", "hover"],
      default: "float",
    },
    speed: {
      type: Number,
      default: 1,
      min: 0,
      max: 10,
    },
  },
  { _id: false }
);

const threeDObjectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["productCard", "text3D", "imagePlane", "button3D"],
      required: true,
    },
    position: vector3Schema,
    rotation: vector3Schema,
    scale: {
      type: [Number],
      default: [1, 1, 1],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length === 3;
        },
        message: "Scale values must contain exactly 3 numbers.",
      },
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    animation: {
      type: animationSchema,
      default: () => ({ type: "float", speed: 1 }),
    },
  },
  { _id: false }
);

const threeDProjectSchema = new mongoose.Schema(
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
      unique: true,
      index: true,
    },
    builderMode: {
      type: String,
      enum: ["normal", "3d"],
      default: "3d",
    },
    scene: {
      camera: {
        position: vector3Schema,
        rotation: vector3Schema,
      },
      objects: {
        type: [threeDObjectSchema],
        default: [],
      },
      lighting: {
        type: {
          type: String,
          enum: ["ambient", "directional"],
          default: "ambient",
        },
        intensity: {
          type: Number,
          default: 1,
          min: 0,
          max: 10,
        },
      },
    },
    source: {
      type: {
        type: String,
        enum: ["builder", "dev", "ai", "manual"],
        default: "manual",
      },
      refId: {
        type: String,
        default: "",
        trim: true,
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

threeDProjectSchema.pre("save", function (next) {
  const maxSize = 2 * 1024 * 1024;
  const serialized = JSON.stringify(this.toObject ? this.toObject() : this);

  if (serialized.length > maxSize) {
    return next(new Error("3D scene data exceeds maximum size limit (2MB)"));
  }

  next();
});

export default mongoose.model("ThreeDProject", threeDProjectSchema);
