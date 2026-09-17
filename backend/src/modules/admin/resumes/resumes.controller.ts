import type { Request, Response, NextFunction } from "express";
import * as resumesService from "./resumes.service.js";

/**
 * Retrieves learner resumes with ATS scoring and role filtering.
 * @route GET /api/admin/resumes
 */
export const getAdminResumes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 20;
    const search = req.query.search as string | undefined;
    const minScore = req.query.minScore ? parseInt(req.query.minScore as string) : undefined;
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;

    const result = await resumesService.getAdminResumes(skip, take, search, minScore, days);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves full ATS breakdown and resume content for a specific resume ID.
 * @route GET /api/admin/resumes/:id
 */
export const getAdminResumeDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const resume = await resumesService.getAdminResumeDetails(id);
    res.json(resume);
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};
