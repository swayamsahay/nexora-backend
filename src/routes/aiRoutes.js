import express from "express";
import {
  generateDescription,
  generateStore,
  generateCompleteApp,
  generateBackend,
  generateDatabase,
  getAIProjects,
} from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateGenerateDescription,
  validateGenerateBackend,
  validateGenerateDatabase,
  validateGenerateStore,
  validateGenerateApp,
} from "../middleware/validators/aiValidators.js";

const router = express.Router();

// Public endpoints (template generation)
router.post("/generate-store", validateGenerateStore, generateStore);
router.post("/generate-description", validateGenerateDescription, generateDescription);

// Protected endpoints (AI Builder)
router.post("/generate-app", protect, validateGenerateApp, generateCompleteApp);
router.post("/generate-backend", protect, validateGenerateBackend, generateBackend);
router.post("/generate-database", protect, validateGenerateDatabase, generateDatabase);
router.get("/projects", protect, getAIProjects);

export default router;