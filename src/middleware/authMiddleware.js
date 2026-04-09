import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createError } from "../utils/apiResponse.js";
import { getJwtSecret } from "../utils/token.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(createError("Not authorized, token missing.", 401));
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      return next(createError("Not authorized, invalid authorization header.", 401));
    }

    const decoded = jwt.verify(token, getJwtSecret());

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(createError("Not authorized, user not found.", 401));
    }

    req.user = {
      id: user._id,
      email: user.email,
    };

    return next();
  } catch (error) {
    return next(createError("Not authorized, invalid token.", 401));
  }
};