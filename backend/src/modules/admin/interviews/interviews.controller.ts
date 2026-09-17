import type { Request, Response, NextFunction } from "express";
import * as interviewsService from "./interviews.service.js";

/**
 * Retrieves paginated mock interview sessions with score aggregation and status filtering.
 * @route GET /api/admin/interviews
 */
export const getAdminInterviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 20;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;

    const result = await interviewsService.getAdminInterviews(skip, take, search, status, days);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves full details, questions, answers, and AI evaluation for a single interview session.
 * @route GET /api/admin/interviews/:id
 */
export const getAdminInterviewDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const session = await interviewsService.getAdminInterviewDetails(id);
    res.json(session);
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};
