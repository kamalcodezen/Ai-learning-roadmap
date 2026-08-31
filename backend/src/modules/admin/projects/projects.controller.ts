import type { Request, Response, NextFunction } from "express";
import * as projectsService from "./projects.service.js";

export const getAdminProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 20;
    const search = req.query.search as string | undefined;
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;
    const result = await projectsService.getAdminProjects(skip, take, search, days);
    res.json(result);
  } catch (error) { next(error); }
};
