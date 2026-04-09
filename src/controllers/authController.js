import {
  getUserProfileById,
  loginUser,
  registerUser,
} from "../services/authService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  console.log("[AUTH] Signup attempt", { email });
  const data = await registerUser(name, email, password);
  return res.status(201).json({
    success: true,
    token: data.token,
    user: data.user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("[AUTH] Login attempt", { email });
  const data = await loginUser(email, password);
  return res.status(200).json({
    success: true,
    token: data.token,
    user: data.user,
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfileById(req.user.id);
  return res.status(200).json({
    success: true,
    user,
  });
});