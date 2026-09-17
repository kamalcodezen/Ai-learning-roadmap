import type { Request, Response, NextFunction } from "express";
import * as subscriptionsService from "./subscriptions.service.js";

/**
 * Retrieves subscription tier analytics, platform MRR/ARR, and recent subscribers.
 * @route GET /api/admin/subscriptions
 */
export const getAdminSubscriptions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await subscriptionsService.getAdminSubscriptionsOverview();
    res.json(result);
  } catch (error) {
    next(error);
  }
};
