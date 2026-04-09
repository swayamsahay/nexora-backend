import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, createError } from "../utils/apiResponse.js";
import {
  getDevProject,
  updateFrontendCode,
  updateBackendRoutes,
  updateDatabaseSchema,
  rollbackDevVersion,
} from "../services/devService.js";

/**
 * Get dev project (frontend + backend + database views)
 */
export const getDevProjectView = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const userId = req.user.id;

  console.log("[Dev Controller] Get view request", { userId, storeId });

  if (!storeId) {
    throw createError("storeId is required", 400);
  }

  const devView = await getDevProject(userId, storeId);

  return sendSuccess(res, 200, devView, "Dev project view retrieved successfully.");
});

/**
 * Update frontend code structure
 */
export const updateFrontend = asyncHandler(async (req, res) => {
  const { storeId, frontendCode } = req.body;
  const userId = req.user.id;

  console.log("[Dev Controller] Update frontend request", { userId, storeId });

  if (!storeId) {
    throw createError("storeId is required", 400);
  }

  if (!frontendCode || typeof frontendCode !== "object") {
    throw createError("frontendCode must be an object", 400);
  }

  const project = await updateFrontendCode(userId, storeId, frontendCode);

  return sendSuccess(res, 200, { project }, "Frontend code updated successfully.");
});

/**
 * Update backend routes
 */
export const updateBackend = asyncHandler(async (req, res) => {
  const { storeId, backendRoutes } = req.body;
  const userId = req.user.id;

  console.log("[Dev Controller] Update backend request", { userId, storeId });

  if (!storeId) {
    throw createError("storeId is required", 400);
  }

  if (!backendRoutes || typeof backendRoutes !== "object") {
    throw createError("backendRoutes must be an object", 400);
  }

  const project = await updateBackendRoutes(userId, storeId, backendRoutes);

  return sendSuccess(res, 200, { project }, "Backend routes updated successfully.");
});

/**
 * Update database schema
 */
export const updateDatabase = asyncHandler(async (req, res) => {
  const { storeId, databaseSchema } = req.body;
  const userId = req.user.id;

  console.log("[Dev Controller] Update database request", { userId, storeId });

  if (!storeId) {
    throw createError("storeId is required", 400);
  }

  if (!databaseSchema || typeof databaseSchema !== "object") {
    throw createError("databaseSchema must be an object", 400);
  }

  const project = await updateDatabaseSchema(userId, storeId, databaseSchema);

  return sendSuccess(res, 200, { project }, "Database schema updated successfully.");
});

/**
 * Rollback to previous dev project version
 */
export const rollbackDev = asyncHandler(async (req, res) => {
  const { storeId, versionNumber } = req.body;
  const userId = req.user.id;

  console.log("[Dev Controller] Rollback request", { userId, storeId, versionNumber });

  if (!storeId) {
    throw createError("storeId is required", 400);
  }

  if (typeof versionNumber !== "number") {
    throw createError("versionNumber must be a number", 400);
  }

  const project = await rollbackDevVersion(userId, storeId, versionNumber);

  return sendSuccess(res, 200, { project }, "Dev project rolled back successfully.");
});
