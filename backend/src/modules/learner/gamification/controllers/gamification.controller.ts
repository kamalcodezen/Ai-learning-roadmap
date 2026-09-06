import type { Request, Response, NextFunction } from "express";
import {
  getUserGamificationProfile,
  evaluateAchievements,
} from "../services/gamification.service.js";
import { getSkillTree } from "../services/skill-tree.service.js";

export const getGamificationProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId as string;
    const profile = await getUserGamificationProfile(userId);
    return res.status(200).json({
      success: true,
      message: "Gamification profile fetched successfully.",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getSkillTreeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId as string;
    const skillTree = await getSkillTree(userId);
    return res.status(200).json({
      success: true,
      message: "Skill tree fetched successfully.",
      data: skillTree,
    });
  } catch (error) {
    next(error);
  }
};

export const syncAchievementsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId as string;
    const unlocked = await evaluateAchievements(userId);
    return res.status(200).json({
      success: true,
      message: "Achievements synchronized successfully.",
      data: {
        newlyUnlocked: unlocked,
      },
    });
  } catch (error) {
    next(error);
  }
};
