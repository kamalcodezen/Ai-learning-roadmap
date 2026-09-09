import type { Request, Response, NextFunction } from "express";
import * as notificationService from "../services/notification.service.js";

const getUserId = (req: Request) => {
  const userId = req.userId as string;
  if (!userId) throw new Error("Unauthorized");
  return userId;
};

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = await notificationService.getNotifications(
      userId,
      isNaN(limit) ? 20 : limit,
      isNaN(offset) ? 0 : offset
    );

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const result = await notificationService.getUnreadCount(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const notificationId = req.params.id as string;
    if (!notificationId) {
      return res.status(400).json({ success: false, error: "Notification ID required" });
    }

    const updated = await notificationService.markAsRead(userId, notificationId);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.message === "Notification not found") {
      return res.status(404).json({ success: false, error: "Notification not found" });
    }
    console.error("Error in markAsRead:", error);
    res.status(500).json({ success: false, error: "Failed to update notification" });
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const result = await notificationService.markAllAsRead(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
