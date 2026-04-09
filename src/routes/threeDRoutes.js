import express from "express";
import {
  deleteScene,
  getScene,
  saveScene,
  syncScene,
  updateBuilderMode,
  updateScene,
} from "../controllers/threeDController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/save", protect, saveScene);
router.get("/:storeId", protect, getScene);
router.put("/update", protect, updateScene);
router.delete("/:storeId", protect, deleteScene);
router.put("/mode", protect, updateBuilderMode);
router.post("/sync", protect, syncScene);

export default router;
