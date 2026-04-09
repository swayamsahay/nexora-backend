import express from "express";
import {
  getPublicSite,
  publishStore,
  unpublishStore,
  updatePublish,
} from "../controllers/publishController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/publish", protect, publishStore);
router.put("/publish/update", protect, updatePublish);
router.delete("/publish/:storeId", protect, unpublishStore);
router.get("/public/:slug", getPublicSite);

export default router;
