import jwt from "jsonwebtoken";

const resolveJwtSecret = () => process.env.JWT_SECRET || "dev_jwt_secret_change_me";

export const generateToken = (userId) => {
  return jwt.sign({ id: userId.toString() }, resolveJwtSecret(), {
    expiresIn: "7d",
  });
};

export const getJwtSecret = () => resolveJwtSecret();