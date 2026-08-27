import type { Request, Response, NextFunction } from "express";
import * as learningPathService from "../services/learning-path.service.js";

// Utility to extract userId securely
const getUserId = (req: Request) => {
  const userId = req.query.userId as string;
  if (!userId) throw new Error("userId query parameter is required.");
  return userId;
};

export const getLearningPath = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await learningPathService.getOrGenerateLearningPath(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};
