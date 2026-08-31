import type { Request, Response, NextFunction } from "express";
import * as activityService from "./activity.service.js";

export const getAdminActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 20;
    const result = await activityService.getAdminActivity(skip, take);
    res.json(result);
  } catch (error) { next(error); }
};
