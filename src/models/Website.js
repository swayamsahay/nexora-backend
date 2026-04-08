import mongoose from "mongoose";

const websiteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      unique: true,
      index: true,
    },
    layout: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        header: {},
        sections: [],
        theme: {},
      },
    },
    theme: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    domain: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Website = mongoose.model("Website", websiteSchema);

export default Website;