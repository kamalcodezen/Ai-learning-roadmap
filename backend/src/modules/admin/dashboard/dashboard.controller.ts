import type { Request, Response, NextFunction } from "express";
import * as adminDashboardService from "./dashboard.service.js";

export const getDashboardOverview = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await adminDashboardService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
