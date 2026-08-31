import type { Request, Response, NextFunction } from "express";
import * as roadmapsService from "./roadmaps.service.js";

export const getAdminRoadmaps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 20;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const targetRole = req.query.targetRole as string | undefined;
    
    const result = await roadmapsService.getAdminRoadmaps(skip, take, search, status, targetRole);
    res.json(result);
  } catch (error) { next(error); }
};
