import type { Request, Response, NextFunction } from "express";
import * as skillProofService from "./skill-proof.service.js";

/**
 * Retrieves learner skill proof artifacts, verified evidence links, and repository badges.
 * @route GET /api/admin/skill-proof
 */
export const getAdminSkillProof = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 20;
    const search = req.query.search as string | undefined;
    const result = await skillProofService.getAdminSkillProof(skip, take, search);
    res.json(result);
  } catch (error) { next(error); }
};
