import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { getOwnerAnalytics } from "../services/analyticsService.js";

export const getMyAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getOwnerAnalytics(req.user.id);
  return sendSuccess(res, 200, analytics);
});