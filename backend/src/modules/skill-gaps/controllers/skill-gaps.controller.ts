import type { Request, Response, NextFunction } from "express";
import * as skillgapsService from "../services/skill-gaps.service.js";

const getUserId = (req: Request) => {
  const userId = req.query.userId as string;
  if (!userId) throw new Error("userId query parameter is required.");
  return userId;
};

export const getSkillGaps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await skillgapsService.getSkillGaps(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};
