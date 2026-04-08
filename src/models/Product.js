import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ storeId: 1, createdAt: -1 });
productSchema.index({ storeId: 1, name: 1 });

productSchema.pre("save", function setAvailability(next) {
  if (this.stock <= 0) {
    this.isAvailable = false;
  }

  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;