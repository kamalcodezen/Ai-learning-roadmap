import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import prisma from "../../../lib/prisma.js";
import { requireAuth } from "../../../middlewares/auth.middleware.js";

/**
 * ============================================================
 * SUBSCRIPTION ROUTES
 * ============================================================
 * 1. GET  /api/subscription/status -> Retrieve user's current subscription status
 * 2. POST /api/subscription/sync   -> Update user's plan upon successful payment
 * ============================================================
 */
const router = Router();

// Require authentication for all subscription routes
router.use(requireAuth);

/**
 * 1. GET /api/subscription/status
 * Retrieve user's current subscription status
 */
router.get("/status", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      data: {
        plan: user.plan || "FREE",
        isPlus: user.plan === "PLUS" || user.plan === "PRO" || user.role === "ADMIN",
        isPro: user.plan === "PRO" || user.role === "ADMIN",
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 2. POST /api/subscription/sync
 * Update user's plan upon successful checkout
 * Body: { plan: "PLUS" | "PRO" }
 */
router.post("/sync", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const requestedPlan = (req.body?.plan || "").toUpperCase();

    // Validate: only FREE, PLUS, or PRO are accepted
    const validPlans = ["FREE", "PLUS", "PRO"];
    const newPlan = validPlans.includes(requestedPlan) ? requestedPlan : "PLUS";

    // Update user's plan in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { plan: newPlan },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
      },
    });

    return res.json({
      success: true,
      message: `Successfully updated plan to ${newPlan}.`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
