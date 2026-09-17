import type { Request, Response, NextFunction } from "express";
import * as projectsService from "./projects.service.js";

/**
 * Retrieves learner project capstone submissions, verification scores, and repository links.
 * @route GET /api/admin/projects
 */
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

/**
 * Verifies or revokes verification for a learner capstone project and optionally updates score.
 * @route PATCH /api/admin/projects/:id/verify
 */
export const verifyProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.adminId!;
    const projectId = req.params.id as string;
    const { isVerified, score } = req.body;

    const project = await projectsService.verifyProject(
      adminId,
      projectId,
      Boolean(isVerified),
      score !== undefined ? Number(score) : undefined
    );

    res.json({ success: true, project });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

