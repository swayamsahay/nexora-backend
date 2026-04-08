import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { generateProductDescription, generateStoreTemplate } from "../services/aiService.js";

export const generateStore = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  const data = await generateStoreTemplate(prompt);
  return sendSuccess(res, 200, data, "Store template generated.");
});

export const generateDescription = asyncHandler(async (req, res) => {
  const { name, category } = req.body;
  const data = await generateProductDescription({ name, category });
  return sendSuccess(res, 200, data, "Description generated.");
});