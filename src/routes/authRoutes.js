import express from "express";
import { getProfile, login, register } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateLogin, validateSignup } from "../middleware/validators/authValidators.js";

const router = express.Router();

router.post("/signup", validateSignup, register);
router.post("/register", validateSignup, register);
router.post("/login", validateLogin, login);
router.get("/me", protect, getProfile);

export default router;