import type { Request, Response, NextFunction } from "express";
import * as adminAnalyticsService from "./analytics.service.js";
import { jsonToCsv } from "../../../utils/csv.util.js";
import prisma from "../../../lib/prisma.js";

export const getAdminAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const result = await adminAnalyticsService.getAdminAnalytics(days);
    res.json(result);
  } catch (error) { next(error); }
};

export const exportData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = req.params.entity;
    let data: any[] = [];
    
    switch (entity) {
      case "users":
        data = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
        break;
      case "roadmaps":
        data = await prisma.roadmap.findMany({ select: { id: true, targetRole: true, status: true, userId: true, createdAt: true } });
        break;
      case "assessments":
        data = await prisma.diagnosticAttempt.findMany({ select: { id: true, targetRole: true, status: true, score: true, userId: true, startedAt: true, completedAt: true } });
        break;
      case "projects":
        data = await prisma.project.findMany({ select: { id: true, title: true, score: true, repositoryUrl: true, liveUrl: true, userId: true, createdAt: true } });
        break;
      case "ai-usage":
        data = await prisma.aiUsageLog.findMany({ select: { id: true, provider: true, model: true, feature: true, status: true, durationMs: true, createdAt: true } });
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid export entity." });
    }

    const csvStr = jsonToCsv(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${entity}-export.csv"`);
    res.send(csvStr);
  } catch (error) { next(error); }
};
