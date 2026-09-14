import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";

/**
 * ============================================================
 * PLAN / SUBSCRIPTION MIDDLEWARE
 * ============================================================
 * Checks whether the user's account has the required plan tier.
 * 
 * Example:
 * router.get("/job-reality", requirePlan(["PLUS", "PRO"]), controller);
 * 
 * 1. ADMIN users bypass plan restrictions and access all features.
 * 2. If user's plan is included in allowedPlans, request proceeds.
 * 3. Otherwise returns 403 Forbidden with PAYWALL_RESTRICTED code.
 * ============================================================
 */
export const requirePlan = (allowedPlans: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      // 1. Return 401 if user is not authenticated
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Please log in to access this feature.",
        });
      }

      // 2. Fetch user's plan and role from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, role: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found in database.",
        });
      }

      // 3. Admin users have unrestricted access
      if ((user.role || "").toUpperCase() === "ADMIN") {
        return next();
      }

      // 4. Resolve user's active plan (defaults to FREE)
      const userPlan = (user.plan || "FREE").toUpperCase();
      const normalizedAllowed = allowedPlans.map((p) => p.toUpperCase());

      // 5. Verify if user's plan is in allowed tiers
      const hasAccess = normalizedAllowed.includes(userPlan);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          code: "PAYWALL_RESTRICTED",
          message: `This feature requires an upgraded subscription (${allowedPlans.join(" or ")}).`,
          requiredPlans: allowedPlans,
          currentPlan: userPlan,
        });
      }

      // Proceed to the next handler
      next();
    } catch (error) {
      console.error("[Plan Middleware Error]:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error checking plan access.",
      });
    }
  };
};
