import express from "express";
import { generateDescription, generateStore } from "../controllers/aiController.js";
import {
	validateGenerateDescription,
	validateGenerateStore,
} from "../middleware/validators/aiValidators.js";

const router = express.Router();

router.post("/generate-store", validateGenerateStore, generateStore);
router.post("/generate-description", validateGenerateDescription, generateDescription);

export default router;