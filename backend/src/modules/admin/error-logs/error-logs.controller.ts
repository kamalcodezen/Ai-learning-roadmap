import type { Request, Response, NextFunction } from "express";
import * as errorLogsService from "./error-logs.service.js";

/**
 * Retrieves platform system runtime errors and HTTP exception logs.
 * @route GET /api/admin/error-logs
 */
export const getAdminErrorLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 20;
    const result = await errorLogsService.getAdminErrorLogs(skip, take);
    res.json(result);
  } catch (error) { next(error); }
};
