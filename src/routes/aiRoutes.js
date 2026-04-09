import express from "express";
import {
  generateDescription,
  generateStore,
  generateCompleteApp,
  getAIProjects,
} from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateGenerateDescription,
  validateGenerateStore,
  validateGenerateApp,
} from "../middleware/validators/aiValidators.js";

const router = express.Router();

// Public endpoints (template generation)
router.post("/generate-store", validateGenerateStore, generateStore);
router.post("/generate-description", validateGenerateDescription, generateDescription);

// Protected endpoints (AI Builder)
router.post("/generate-app", protect, validateGenerateApp, generateCompleteApp);
router.get("/projects", protect, getAIProjects);

export default router;