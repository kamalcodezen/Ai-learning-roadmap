import type { Request, Response, NextFunction } from "express";
import * as dashboardService from "../services/dashboard.service.js";


// Utility to extract userId securely
const getUserId = (req: Request) => {
  const userId = req.userId as string;
  if (!userId) throw new Error("userId query parameter is required.");
  return userId;
};

export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getDashboardOverview(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};



















