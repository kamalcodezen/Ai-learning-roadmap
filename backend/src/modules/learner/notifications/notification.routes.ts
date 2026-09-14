import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as notificationController from "./controllers/notification.controller.js";

const router = Router();

router.get("/", requireAuth, notificationController.getNotifications);
router.get("/unread-count", requireAuth, notificationController.getUnreadCount);
router.patch("/read-all", requireAuth, notificationController.markAllAsRead);
router.patch("/:id/read", requireAuth, notificationController.markAsRead);
router.delete("/clear-all", requireAuth, notificationController.clearAllNotifications);
router.delete("/:id", requireAuth, notificationController.deleteNotification);

export default router;

