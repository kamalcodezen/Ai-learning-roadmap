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

    const metadata = (profile?.aiAnalysis as Record<string, any>) || {};
    const defaultPrefs = {
      emailWeeklySummary: true,
      emailAchievementAlerts: true,
      emailMilestoneReminders: true,
      browserAlerts: false,
    };

    const preferences = {
      ...defaultPrefs,
      ...(metadata.notificationPreferences || {}),
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

    const profile = await prisma.careerProfile.findUnique({
      where: { userId },
      select: { aiAnalysis: true },
    });

    const currentAnalysis = (profile?.aiAnalysis as Record<string, any>) || {};
    const existingPrefs = (currentAnalysis.notificationPreferences as Record<string, any>) || {
      emailWeeklySummary: true,
      emailAchievementAlerts: true,
      emailMilestoneReminders: true,
      browserAlerts: false,
    };

    // Only update fields explicitly passed in req.body; preserve existing states for all other fields
    const updatedPreferences = {
      emailWeeklySummary:
        req.body.emailWeeklySummary !== undefined
          ? Boolean(req.body.emailWeeklySummary)
          : Boolean(existingPrefs.emailWeeklySummary ?? true),
      emailAchievementAlerts:
        req.body.emailAchievementAlerts !== undefined
          ? Boolean(req.body.emailAchievementAlerts)
          : Boolean(existingPrefs.emailAchievementAlerts ?? true),
      emailMilestoneReminders:
        req.body.emailMilestoneReminders !== undefined
          ? Boolean(req.body.emailMilestoneReminders)
          : Boolean(existingPrefs.emailMilestoneReminders ?? true),
      browserAlerts:
        req.body.browserAlerts !== undefined
          ? Boolean(req.body.browserAlerts)
          : Boolean(existingPrefs.browserAlerts ?? false),
    };

    const updatedAnalysis = {
      ...currentAnalysis,
      notificationPreferences: updatedPreferences,
    };

    if (profile) {
      await prisma.careerProfile.update({
        where: { userId },
        data: { aiAnalysis: updatedAnalysis },
      });
    } else {
      await prisma.careerProfile.create({
        data: {
          userId,
          targetRole: "SOFTWARE_ENGINEER",
          targetRoleName: "Software Engineer",
          experienceLevel: "BEGINNER",
          aiAnalysis: updatedAnalysis,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      data: updatedPreferences,
    });
  } catch (error) {
    next(error);
  }
};
