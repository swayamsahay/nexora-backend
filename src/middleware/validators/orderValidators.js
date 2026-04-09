import { body, validationResult } from "express-validator";
import { createError } from "../../utils/apiResponse.js";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(createError(errors.array()[0].msg, 400));
  }

  return next();
};

export const validateCreateOrder = [
  body("productId").trim().notEmpty().withMessage("productId is required."),
  body("quantity")
    .notEmpty()
    .withMessage("quantity is required.")
    .bail()
    .isInt({ min: 1 })
    .withMessage("quantity must be at least 1."),
  handleValidationErrors,
];