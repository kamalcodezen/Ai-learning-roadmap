import type { Request, Response, NextFunction } from "express";
import * as careerReadinessService from "./career-readiness.service.js";

export const getAdminCareerReadiness = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await careerReadinessService.getAdminCareerReadiness();
    res.json(result);
  } catch (error) { next(error); }
};
