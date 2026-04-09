import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, createError } from "../utils/apiResponse.js";
import {
  deleteThreeDScene,
  getThreeDScene,
  saveThreeDScene,
  setThreeDBuilderMode,
  syncThreeDFromAIProject,
  syncThreeDFromBuilderProject,
  syncThreeDFromDevProject,
  updateThreeDScene,
} from "../services/threeDService.js";

export const saveScene = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const project = await saveThreeDScene(userId, req.body);

  return sendSuccess(res, 201, { project }, "3D scene saved successfully.");
});

export const getScene = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { storeId } = req.params;

  const project = await getThreeDScene(userId, storeId);
  return sendSuccess(res, 200, { project }, "3D scene loaded successfully.");
});

export const updateScene = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const project = await updateThreeDScene(userId, req.body);

  return sendSuccess(res, 200, { project }, "3D scene updated successfully.");
});

export const deleteScene = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { storeId } = req.params;

  const result = await deleteThreeDScene(userId, storeId);
  return sendSuccess(res, 200, result, "3D scene deleted successfully.");
});

export const updateBuilderMode = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { storeId, mode } = req.body;

  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  const result = await setThreeDBuilderMode(userId, storeId, mode);
  return sendSuccess(res, 200, result, "Builder mode updated.");
});

export const syncScene = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { storeId, sourceType, sourceId } = req.body;

  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  if (!sourceType) {
    throw createError("sourceType is required.", 400);
  }

  let project;
  if (sourceType === "builder") {
    project = await syncThreeDFromBuilderProject(userId, storeId);
  } else if (sourceType === "dev") {
    project = await syncThreeDFromDevProject(userId, storeId);
  } else if (sourceType === "ai") {
    if (!sourceId) {
      throw createError("sourceId is required for AI sync.", 400);
    }
    project = await syncThreeDFromAIProject(userId, storeId, sourceId);
  } else {
    throw createError("Unsupported sourceType.", 400);
  }

  return sendSuccess(res, 200, { project }, "3D scene synced successfully.");
});
