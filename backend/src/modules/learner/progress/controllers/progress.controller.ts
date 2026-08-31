import type { Request, Response, NextFunction } from "express";
import * as progressService from "../services/progress.service.js";

const getUserId = (req: Request) => {
  const userId = req.userId as string;
  if (!userId) throw new Error("userId query parameter is required.");
  return userId;
};

export const getProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await progressService.getProgress(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};
