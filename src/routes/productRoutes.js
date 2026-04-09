import express from "express";
import {
  createProduct,
  deleteProduct,
  getMyStoreProducts,
  getPublicProductsByStoreSlug,
  updateProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/public/:slug", getPublicProductsByStoreSlug);
router.post("/", protect, createProduct);
router.get("/me", protect, getMyStoreProducts);
router.put("/:productId", protect, updateProduct);
router.delete("/:productId", protect, deleteProduct);

export default router;