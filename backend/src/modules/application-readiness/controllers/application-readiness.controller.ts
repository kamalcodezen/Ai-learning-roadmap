import type { Request, Response, NextFunction } from "express";
import * as applicationreadinessService from "../services/application-readiness.service.js";

const getUserId = (req: Request) => {
  const userId = req.query.userId as string;
  if (!userId) throw new Error("userId query parameter is required.");
  return userId;
};

export const getApplicationReadiness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await applicationreadinessService.getApplicationReadiness(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};
