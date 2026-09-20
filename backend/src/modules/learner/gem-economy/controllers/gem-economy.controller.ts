import type { Request, Response, NextFunction } from "express";
import {
  getGemWallet,
  claimDailyStreakGems,
  getGemHistory,
} from "../services/gem-economy.service.js";

const getUserId = (req: Request): string => {
  const userId = req.userId as string;
  if (!userId) {
    throw new Error("Authentication required: userId not found in session.");
  }
  return userId;
};

/**
 * GET /api/gem-economy/wallet
 * Returns current gem balance, streak progress, and claim status.
 */
export const getWalletHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const wallet = await getGemWallet(userId);

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/gem-economy/claim-daily
 * Claims today's daily streak gem reward.
 */
export const claimDailyHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const result = await claimDailyStreakGems(userId);

    res.status(result.success ? 200 : 400).json({
      success: result.success,
      data: result,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/gem-economy/history
 * Returns paginated transaction history of earned gems.
 */
export const getHistoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const history = await getGemHistory(userId, limit, offset);

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (err) {
    next(err);
  }
};
