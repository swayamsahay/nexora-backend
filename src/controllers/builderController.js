import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  getPublishedWebsiteByStore,
  getWebsiteLayoutByStore,
  publishWebsite,
  saveWebsiteLayout,
} from "../services/builderService.js";

export const saveBuilder = asyncHandler(async (req, res) => {
  const website = await saveWebsiteLayout(req.user.id, req.body);
  return sendSuccess(res, 200, { website }, "Builder layout saved.");
});

export const getBuilderByStoreId = asyncHandler(async (req, res) => {
  const website = await getWebsiteLayoutByStore(req.user.id, req.params.storeId);
  return sendSuccess(res, 200, { website });
});

export const publishBuilder = asyncHandler(async (req, res) => {
  const website = await publishWebsite(req.user.id, req.body);
  return sendSuccess(res, 200, { website }, "Builder publish state updated.");
});

export const getPublicBuilderByStoreId = asyncHandler(async (req, res) => {
  const website = await getPublishedWebsiteByStore(req.params.storeId);
  return sendSuccess(res, 200, { website });
});