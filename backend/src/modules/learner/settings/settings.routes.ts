import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import {
  deleteAccount,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "./settings.controller.js";

const router = Router();

router.delete("/account", requireAuth, deleteAccount);
router.get("/preferences", requireAuth, getNotificationPreferences);
router.post("/preferences", requireAuth, updateNotificationPreferences);

export default router;
