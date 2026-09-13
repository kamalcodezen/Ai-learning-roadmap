import type { Request, Response, NextFunction } from "express";
import prisma from "../../../lib/prisma.js";

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { confirmation } = req.body;
    if (confirmation !== "DELETE") {
      return res.status(400).json({
        success: false,
        message: 'Confirmation phrase must be "DELETE" to permanently remove account.',
      });
    }

    // Transactional deletion ensuring all cascade-related data is removed cleanly
    await prisma.$transaction(async (tx) => {
      // Verify user exists
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Deleting user triggers foreign key onDelete: Cascade across all relations:
      // account, session, careerProfile, diagnosticAttempts, interviewSessions,
      // skillStates, roadmaps, projects, activityLogs, skillStateHistories,
      // gamification, xpTransactions, achievements, notifications.
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Account and all associated records permanently deleted.",
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const profile = await prisma.careerProfile.findUnique({
      where: { userId },
      select: { aiAnalysis: true },
    });

    const metadata = (profile?.aiAnalysis as any) || {};
    const preferences = metadata.notificationPreferences || {
      emailWeeklySummary: true,
      emailAchievementAlerts: true,
      emailMilestoneReminders: true,
      browserAlerts: false,
    };

    return res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      emailWeeklySummary = true,
      emailAchievementAlerts = true,
      emailMilestoneReminders = true,
      browserAlerts = false,
    } = req.body;

    const profile = await prisma.careerProfile.findUnique({
      where: { userId },
      select: { aiAnalysis: true },
    });

    const currentAnalysis = (profile?.aiAnalysis as Record<string, any>) || {};
    const updatedAnalysis = {
      ...currentAnalysis,
      notificationPreferences: {
        emailWeeklySummary: Boolean(emailWeeklySummary),
        emailAchievementAlerts: Boolean(emailAchievementAlerts),
        emailMilestoneReminders: Boolean(emailMilestoneReminders),
        browserAlerts: Boolean(browserAlerts),
      },
    };

    await prisma.careerProfile.update({
      where: { userId },
      data: { aiAnalysis: updatedAnalysis },
    });

    return res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      data: updatedAnalysis.notificationPreferences,
    });
  } catch (error) {
    next(error);
  }
};
