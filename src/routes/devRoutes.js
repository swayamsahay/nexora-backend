import express from "express";
import {
  getDevProjectView,
  updateFrontend,
  updateBackend,
  updateDatabase,
  rollbackDev,
} from "../controllers/devController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Dev Mode endpoints (allows viewing and editing frontend/backend/database code)
router.get("/:storeId", protect, getDevProjectView);
router.put("/update-frontend", protect, updateFrontend);
router.put("/update-backend", protect, updateBackend);
router.put("/update-database", protect, updateDatabase);
router.put("/rollback", protect, rollbackDev);

export default router;
