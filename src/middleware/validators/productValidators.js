import { body, validationResult } from "express-validator";
import { createError } from "../../utils/apiResponse.js";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(createError(errors.array()[0].msg, 400));
  }

  return next();
};

export const validateCreateProduct = [
  body("name").trim().notEmpty().withMessage("Product name is required."),
  body("price")
    .notEmpty()
    .withMessage("Product price is required.")
    .bail()
    .isFloat({ min: 0 })
    .withMessage("Product price must be a non-negative number."),
  handleValidationErrors,
];