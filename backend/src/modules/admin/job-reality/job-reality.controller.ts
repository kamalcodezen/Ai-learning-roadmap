import type { Request, Response, NextFunction } from "express";
import * as jobRealityService from "./job-reality.service.js";

export const getAdminJobReality = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await jobRealityService.getAdminJobReality();
    res.json(result);
  } catch (error) { next(error); }
};
