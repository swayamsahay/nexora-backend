import {
  createStoreForUser,
  deleteStoreByUserId,
  getStoreBySlug,
  getStoreByUserId,
  updateStoreByUserId,
} from "../services/storeService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const createStore = asyncHandler(async (req, res) => {
  const store = await createStoreForUser(req.user.id, req.body);
  return sendSuccess(res, 201, { store }, "Store created successfully.");
});

export const getMyStore = asyncHandler(async (req, res) => {
  const store = await getStoreByUserId(req.user.id);
  return sendSuccess(res, 200, { store });
});

export const getPublicStoreBySlug = asyncHandler(async (req, res) => {
  const store = await getStoreBySlug(req.params.slug);
  return sendSuccess(res, 200, { store });
});

export const updateMyStore = asyncHandler(async (req, res) => {
  const store = await updateStoreByUserId(req.user.id, req.body);
  return sendSuccess(res, 200, { store }, "Store updated successfully.");
});

export const deleteMyStore = asyncHandler(async (req, res) => {
  const result = await deleteStoreByUserId(req.user.id);
  return sendSuccess(res, 200, result);
});