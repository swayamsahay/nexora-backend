import express from "express";
import {
  getBuilderByStoreId,
  getPublicBuilderByStoreId,
  publishBuilder,
  saveBuilder,
} from "../controllers/builderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/save", protect, saveBuilder);
// Public read path for published websites used by storefront rendering.
router.get("/public/:storeId", getPublicBuilderByStoreId);
router.get("/:storeId", protect, getBuilderByStoreId);
router.put("/publish", protect, publishBuilder);

export default router;