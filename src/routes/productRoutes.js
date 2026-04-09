import express from "express";
import {
  createProduct,
  deleteProduct,
  getMyStoreProducts,
  getPublicProductsByStoreSlug,
  updateProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateCreateProduct } from "../middleware/validators/productValidators.js";

const router = express.Router();

router.get("/public/:slug", getPublicProductsByStoreSlug);
router.post("/", protect, validateCreateProduct, createProduct);
router.get("/me", protect, getMyStoreProducts);
router.put("/:productId", protect, updateProduct);
router.delete("/:productId", protect, deleteProduct);

export default router;