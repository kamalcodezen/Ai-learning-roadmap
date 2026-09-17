import type { Request, Response, NextFunction } from "express";
import * as learningDebtService from "./learning-debt.service.js";

/**
 * Retrieves platform aggregate curriculum debt, overdue concepts, and remediation queues.
 * @route GET /api/admin/learning-debt
 */
export const getAdminLearningDebt = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await learningDebtService.getAdminLearningDebt();
    res.json(result);
  } catch (error) { next(error); }
};
