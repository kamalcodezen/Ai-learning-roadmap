import type { Request, Response, NextFunction } from "express";
import * as learningDebtService from "./learning-debt.service.js";

export const getAdminLearningDebt = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await learningDebtService.getAdminLearningDebt();
    res.json(result);
  } catch (error) { next(error); }
};
