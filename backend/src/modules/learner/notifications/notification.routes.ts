import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as notificationController from "./controllers/notification.controller.js";

const router = Router();

router.get("/", requireAuth, notificationController.getNotifications);
router.get("/unread-count", requireAuth, notificationController.getUnreadCount);
router.patch("/:id/read", requireAuth, notificationController.markAsRead);
router.patch("/read-all", requireAuth, notificationController.markAllAsRead);

export default router;
