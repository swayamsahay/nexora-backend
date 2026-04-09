import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, createError } from "../utils/apiResponse.js";
import { generateProductDescription, generateStoreTemplate } from "../services/aiService.js";
import {
  saveAIProject,
  getUserProjects,
} from "../services/aiBuilderService.js";
import {
  generateBackendProject,
  generateDatabaseProject,
  generatePhase4Project,
} from "../services/aiPhase4Service.js";

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

/**
 * Generate complete app from prompt (AI Builder)
 */
export const generateCompleteApp = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  const userId = req.user.id;

  console.log("[AI Controller] Generate app request", {
    userId,
    promptLength: prompt?.length,
  });

  try {
    // Generate frontend, backend, and database structure
    const generationResult = generatePhase4Project(prompt);

    // Save to database for history
    const project = await saveAIProject(userId, prompt, generationResult);

    return sendSuccess(
      res,
      200,
      {
        projectId: project._id,
        category: generationResult.category,
        theme: generationResult.theme,
        ...generationResult.generatedData,
      },
      "Complete app generated successfully."
    );
  } catch (error) {
    console.error("[AI Controller] Error generating app:", error.message);
    throw createError(error.message || "Failed to generate app", 400);
  }
});

export const generateBackend = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  const data = generateBackendProject(prompt);
  return sendSuccess(res, 200, data, "Backend generated successfully.");
});

export const generateDatabase = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  const data = generateDatabaseProject(prompt);
  return sendSuccess(res, 200, data, "Database schema generated successfully.");
});

/**
 * Get user's AI generation history
 */
export const getAIProjects = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 20, skip = 0 } = req.query;

  console.log("[AI Controller] Fetch projects request", {
    userId,
    limit,
    skip,
  });

  try {
    const result = await getUserProjects(userId, parseInt(limit), parseInt(skip));

    return sendSuccess(res, 200, result, "AI projects fetched successfully.");
  } catch (error) {
    console.error("[AI Controller] Error fetching projects:", error.message);
    throw createError(error.message || "Failed to fetch projects", 400);
  }
});