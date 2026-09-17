import type { Request, Response, NextFunction } from "express";
import * as careertwinService from "../services/career-twin.service.js";

const getUserId = (req: Request) => {
  const userId = req.userId as string;
  if (!userId) throw new Error("userId query parameter is required.");
  return userId;
};

export const getCareerTwin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = (req.query.role as string) || undefined;
    const data = await careertwinService.getCareerTwin(getUserId(req), role);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
