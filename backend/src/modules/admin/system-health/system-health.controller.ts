import type { Request, Response, NextFunction } from "express";
import * as systemHealthService from "./system-health.service.js";

export const getSystemHealth = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const health = await systemHealthService.getSystemHealth();
    res.json(health);
  } catch (error) {
    next(error);
  }
};
