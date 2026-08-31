import type { Request, Response, NextFunction } from "express";
import * as assessmentsService from "./assessments.service.js";

export const getAdminAssessments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 20;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;

    const result = await assessmentsService.getAdminAssessments(skip, take, search, status, days);
    res.json(result);
  } catch (error) { next(error); }
};
