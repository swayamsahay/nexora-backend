import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, createError } from "../utils/apiResponse.js";
import {
  getPublicSiteBySlug,
  publishSite,
  unpublishSite,
  updatePublishedSite,
} from "../services/publishService.js";

export const publishStore = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await publishSite(userId, req.body);

  return sendSuccess(res, 201, result, "Store published successfully.");
});

export const updatePublish = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await updatePublishedSite(userId, req.body);

  return sendSuccess(res, 200, result, "Published site updated successfully.");
});

export const unpublishStore = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { storeId } = req.params;

  if (!storeId) {
    throw createError("storeId is required.", 400);
  }

  const result = await unpublishSite(userId, storeId);
  return sendSuccess(res, 200, result, "Store unpublished successfully.");
});

export const getPublicSite = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const site = await getPublicSiteBySlug(slug);
  return sendSuccess(res, 200, site, "Public site loaded successfully.");
});
