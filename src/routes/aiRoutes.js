import express from "express";
import { generateDescription, generateStore } from "../controllers/aiController.js";

const router = express.Router();

router.post("/generate-store", generateStore);
router.post("/generate-description", generateDescription);

export default router;