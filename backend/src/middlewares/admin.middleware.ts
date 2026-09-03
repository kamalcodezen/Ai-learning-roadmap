import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";

// We extend Express Request to include adminId
declare global {
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}



export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.query.userId || req.body.userId) as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing userId in request.",
      });
    }

    // Verify user role in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found.",
      });
    }

    // RBAC Check
    if ((user.role || "").toUpperCase() !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required.",
      });
    }

    // Attach verified admin ID to request
    req.adminId = userId;

    next();
  } catch (error) {
    console.error("[Admin Middleware Error]", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authorization.",
    });
  }
};
