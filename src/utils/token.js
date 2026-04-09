import jwt from "jsonwebtoken";

const resolveJwtSecret = () => {
  const jwtSecret = process.env.JWT_SECRET?.trim();

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required.");
  }

  return jwtSecret;
};

export const generateToken = (userId) => {
  return jwt.sign({ id: userId.toString() }, resolveJwtSecret(), {
    expiresIn: "7d",
  });
};

export const getJwtSecret = () => resolveJwtSecret();