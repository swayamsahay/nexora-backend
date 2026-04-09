import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, createError } from "../utils/apiResponse.js";
import {
  saveBuilderProject,
  getBuilderProject,
  updateBuilderSections,
  deleteBuilderProject,
  rollbackVersion,
  getVersionHistory,
} from "../services/builderService.js";
import { syncBuilderToDev } from "../services/devService.js";

/**
 * Save or update builder project (Phase 3)
 */
export const saveBuilderProject_v3 = asyncHandler(async (req, res) => {
  const { storeId, layout, components, pages, metadata } = req.body;
  const userId = req.user.id;

  console.log("[Builder V3] Save request", { userId, storeId });

  if (!storeId) {
    throw createError("storeId is required", 400);
  }

  const builderData = { layout, components, pages, metadata };
  const project = await saveBuilderProject(userId, storeId, builderData);

  // Auto-sync to dev project
  try {
    await syncBuilderToDev(userId, storeId, project);
  } catch (error) {
    console.warn("[Builder V3] Dev sync warning:", error.message);
  }

  return sendSuccess(res, 200, { project }, "Builder project saved successfully.");
});

/**
 * Get builder project (Phase 3)
 */
export const getBuilderProject_v3 = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const userId = req.user.id;

  console.log("[Builder V3] Get request", { userId, storeId });

  if (!storeId) {
    throw createError("storeId is required", 400);
  }

  const project = await getBuilderProject(userId, storeId);

  return sendSuccess(res, 200, { project }, "Builder project retrieved successfully.");
});

/**
 * Update builder sections (Phase 3)
 */
export const updateBuilderSections_v3 = asyncHandler(async (req, res) => {
  const { storeId, sections } = req.body;
  const userId = req.user.id;

  console.log("[Builder V3] Update sections request", { userId, storeId });

  if (!storeId) {
    throw createError("storeId is required", 400);
  }

  if (!Array.isArray(sections)) {
    throw createError("sections must be an array", 400);
  }

  const project = await updateBuilderSections(userId, storeId, sections);

  return sendSuccess(res, 200, { project }, "Builder sections updated successfully.");
});

/**
 * Delete builder project (Phase 3)
 */
export const deleteBuilderProject_v3 = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const userId = req.user.id;

  console.log("[Builder V3] Delete request", { userId, storeId });

  if (!storeId) {
    throw createError("storeId is required", 400);
  }

  const result = await deleteBuilderProject(userId, storeId);

  return sendSuccess(res, 200, result, "Builder project deleted successfully.");
});

/**
 * Rollback to previous version (Phase 3)
 */
export const rollbackBuilderVersion_v3 = asyncHandler(async (req, res) => {
  const { storeId, versionNumber } = req.body;
  const userId = req.user.id;

  console.log("[Builder V3] Rollback request", { userId, storeId, versionNumber });

  if (!storeId) {
    throw createError("storeId is required", 400);
  }

  if (typeof versionNumber !== "number") {
    throw createError("versionNumber must be a number", 400);
  }

  const project = await rollbackVersion(userId, storeId, versionNumber);

  return sendSuccess(res, 200, { project }, "Builder project rolled back successfully.");
});

/**
 * Get version history (Phase 3)
 */
export const getBuilderVersionHistory_v3 = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const userId = req.user.id;

  console.log("[Builder V3] Get version history request", { userId, storeId });

  if (!storeId) {
    throw createError("storeId is required", 400);
  }

  const history = await getVersionHistory(userId, storeId);

  return sendSuccess(res, 200, history, "Version history retrieved successfully.");
});
