import type { Request, Response, NextFunction } from "express";
import * as careeralignmentService from "../services/career-alignment.service.js";

const getUserId = (req: Request) => {
  const userId = req.userId as string;
  if (!userId) throw new Error("userId query parameter is required.");
  return userId;
};

export const getCareerAlignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await careeralignmentService.getCareerAlignment(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};
