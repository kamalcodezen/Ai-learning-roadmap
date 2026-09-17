import type { Request, Response, NextFunction } from "express";
import * as adminAnalyticsService from "./analytics.service.js";
import { jsonToCsv } from "../../../utils/csv.util.js";
import prisma from "../../../lib/prisma.js";

export type ExportableEntity =
  | "users"
  | "roadmaps"
  | "assessments"
  | "projects"
  | "ai-usage"
  | "audit-logs"
  | "skill-proof"
  | "error-logs"
  | "learning-debt"
  | "skill-health"
  | "career-readiness"
  | "job-reality"
  | "activity";

/**
 * Retrieves aggregate platform analytics across learners, roadmaps, and AI usage.
 * @route GET /api/admin/analytics
 */
export const getAdminAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const result = await adminAnalyticsService.getAdminAnalytics(days);
    res.json(result);
  } catch (error) { next(error); }
};

/**
 * Exports tabular platform data as CSV for auditing and external analysis.
 * @route GET /api/admin/export/:entity
 */
export const exportData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = req.params.entity;
    let data: any[] = [];
    
    switch (entity) {
      case "users":
        data = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, plan: true, createdAt: true } });
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
      case "audit-logs":
        data = await prisma.adminAuditLog.findMany({ select: { id: true, adminId: true, action: true, targetId: true, createdAt: true } });
        break;
      case "skill-proof":
        data = await prisma.projectEvidence.findMany({ select: { id: true, projectId: true, userId: true, skillName: true, evidenceType: true, url: true, createdAt: true } });
        break;
      case "error-logs":
        data = await prisma.errorLog.findMany({ select: { id: true, errorType: true, message: true, endpoint: true, method: true, statusCode: true, userId: true, createdAt: true } });
        break;
      case "learning-debt":
      case "skill-health":
        data = await prisma.skillState.findMany({ select: { id: true, userId: true, skillName: true, knowledgeScore: true, practiceScore: true, projectScore: true, evidenceScore: true, lastReviewed: true } });
        break;
      case "career-readiness":
      case "job-reality":
        data = await prisma.careerProfile.findMany({ select: { id: true, userId: true, targetRole: true, targetRoleName: true, experienceLevel: true, resumeScore: true, interviewScore: true, createdAt: true } });
        break;
      case "activity":
        data = await prisma.activityLog.findMany({ select: { id: true, userId: true, type: true, description: true, createdAt: true } });
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
