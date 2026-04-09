import express from "express";
import {
  createStore,
  deleteMyStore,
  getMyStore,
  getPublicStoreBySlug,
  updateMyStore,
} from "../controllers/storeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateCreateStore } from "../middleware/validators/storeValidators.js";

const router = express.Router();

router.get("/public/:slug", getPublicStoreBySlug);
router.post("/", protect, validateCreateStore, createStore);
router.get("/me", protect, getMyStore);
router.put("/me", protect, updateMyStore);
router.delete("/me", protect, deleteMyStore);

export default router;