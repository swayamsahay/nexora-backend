import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getJwtSecret } from "../utils/token.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Not authorized, token missing." });
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, invalid authorization header." });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found." });
    }

    req.user = {
      id: user._id,
      email: user.email,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized, invalid token." });
  }
};