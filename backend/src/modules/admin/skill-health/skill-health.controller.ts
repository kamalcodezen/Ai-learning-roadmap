import type { Request, Response, NextFunction } from "express";
import * as skillHealthService from "./skill-health.service.js";

/**
 * Retrieves platform aggregate skill health indices, decay rates, and mastery distributions.
 * @route GET /api/admin/skill-health
 */
export const getAdminSkillHealth = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await skillHealthService.getAdminSkillHealth();
    res.json(result);
  } catch (error) { next(error); }
};
