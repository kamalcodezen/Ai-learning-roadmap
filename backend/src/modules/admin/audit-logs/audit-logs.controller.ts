import type { Request, Response, NextFunction } from "express";
import * as auditLogsService from "./audit-logs.service.js";

export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 20;

    const result = await auditLogsService.getAuditLogs(skip, take);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
