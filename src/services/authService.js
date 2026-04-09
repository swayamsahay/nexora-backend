import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/token.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  plan: user.plan,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const registerUser = async (name, email, password) => {
  if (!name || !email || !password) {
    const error = new Error("Name, email and password are required.");
    error.statusCode = 400;
    throw error;
  }

  if (!name.trim() || !email.trim() || !password.trim()) {
    const error = new Error("Name, email and password cannot be empty.");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    const error = new Error("Please provide a valid email address.");
    error.statusCode = 400;
    throw error;
  }

  if (password.trim().length < 6) {
    const error = new Error("Password must be at least 6 characters long.");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error("User already exists.");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  const token = generateToken(user._id);

  return {
    user: sanitizeUser(user),
    token,
  };
};

export const loginUser = async (email, password) => {
  if (!email || !password) {
    const error = new Error("Email and password are required.");
    error.statusCode = 400;
    throw error;
  }

  if (!email.trim() || !password.trim()) {
    const error = new Error("Email and password cannot be empty.");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    const error = new Error("Please provide a valid email address.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    user: sanitizeUser(user),
    token,
  };
};

export const getUserProfileById = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
};