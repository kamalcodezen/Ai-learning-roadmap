import type { Request, Response, NextFunction } from "express";
import * as jobRealityService from "./job-reality.service.js";

/**
 * Retrieves platform industry job reality calibration, role demand, and market expectations.
 * @route GET /api/admin/job-reality
 */
export const getAdminJobReality = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await jobRealityService.getAdminJobReality();
    res.json(result);
  } catch (error) { next(error); }
};
