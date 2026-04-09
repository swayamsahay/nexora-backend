import { body, validationResult } from "express-validator";
import { createError } from "../../utils/apiResponse.js";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(createError(errors.array()[0].msg, 400));
  }

  return next();
};

export const validateGenerateStore = [
  body("prompt").trim().notEmpty().withMessage("prompt is required."),
  handleValidationErrors,
];

export const validateGenerateDescription = [
  body("name").trim().notEmpty().withMessage("name is required."),
  body("category").trim().notEmpty().withMessage("category is required."),
  handleValidationErrors,
];

export const validateGenerateApp = [
  body("prompt")
    .trim()
    .notEmpty()
    .withMessage("prompt is required.")
    .bail()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Prompt must be between 10 and 1000 characters."),
  handleValidationErrors,
];