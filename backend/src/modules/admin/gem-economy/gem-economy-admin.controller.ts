import type { Request, Response, NextFunction } from "express";
import * as gemEconomyAdminService from "./gem-economy-admin.service.js";

/**
 * GET /api/admin/gem-economy/overview
 */
export async function getGemEconomyOverview(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await gemEconomyAdminService.getGemEconomyOverview();
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/gem-economy/transactions
 */
export async function getGemTransactions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = req.query.search as string | undefined;

    const result = await gemEconomyAdminService.getAdminGemTransactions(limit, offset, search);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/gem-economy/adjust
 */
export async function adjustUserGems(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  try {
    const adminId = req.adminId || (req.query.userId as string) || "admin";
    const { targetUserId, amount, reason } = req.body;

    if (!targetUserId || typeof amount !== "number") {
      return res.status(400).json({
        success: false,
        message: "targetUserId and numeric amount are required.",
      });
    }

    const result = await gemEconomyAdminService.adjustUserGems(
      adminId,
      targetUserId,
      amount,
      reason || ""
    );

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to adjust gems" });
  }
}

/**
 * GET /api/admin/gem-economy/search-learners?q=...
 */
export async function searchLearners(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const q = (req.query.q as string) || "";
    const results = await gemEconomyAdminService.searchLearnersForGems(q);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/gem-economy/at-risk
 */
export async function getAtRiskLearners(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = req.query.search as string | undefined;
    const learners = await gemEconomyAdminService.getAtRiskLearners(limit, offset, search);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.json({ success: true, data: learners });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/gem-economy/remind
 */
export async function sendRecoveryReminder(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  try {
    const adminId = req.adminId || (req.query.userId as string) || "admin";
    const { targetUserId, customMessage } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "targetUserId is required.",
      });
    }

    const result = await gemEconomyAdminService.sendRecoveryReminder(
      adminId,
      targetUserId,
      customMessage
    );

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to send reminder" });
  }
}
