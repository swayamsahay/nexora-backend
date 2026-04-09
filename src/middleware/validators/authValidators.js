import { body, validationResult } from "express-validator";
import { createError } from "../../utils/apiResponse.js";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(createError(errors.array()[0].msg, 400));
  }

  return next();
};

export const validateSignup = [
  body("email").trim().isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),
  body("password").isString().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long."),
  handleValidationErrors,
];

export const validateLogin = [
  body("email").trim().isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),
  body("password").isString().notEmpty().withMessage("Password is required."),
  handleValidationErrors,
];