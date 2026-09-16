import type { Request, Response, NextFunction } from "express";
import * as broadcastService from "./broadcast.service.js";

/**
 * Retrieves broadcast transmission history and learner cohort statistics.
 * @route GET /api/admin/broadcasts
 */
export const getBroadcasts = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await broadcastService.getBroadcasts();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Dispatches a push notification broadcast to specified learner cohorts.
 * @route POST /api/admin/broadcasts
 */
export const createBroadcast = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, message, targetCohort, priority, actionUrl } = req.body;
    const senderId = (req.query.userId as string) || (req.body.userId as string);

    if (!title || !message) {
      return res.status(400).json({
        message: "Title and message are required for broadcast.",
      });
    }

    const result = await broadcastService.createBroadcast({
      title: title.trim(),
      message: message.trim(),
      targetCohort: targetCohort || "ALL",
      priority: priority || "NORMAL",
      actionUrl,
      senderId,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
