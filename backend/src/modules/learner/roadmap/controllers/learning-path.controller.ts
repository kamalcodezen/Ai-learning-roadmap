import type { Request, Response, NextFunction } from "express";
import * as learningPathService from "../services/learning-path.service.js";
import { getCuratedResourcesForMilestone } from "../services/resource-curator.service.js";

// Utility to extract userId securely
const getUserId = (req: Request) => {
  const userId = req.userId as string;
  if (!userId) throw new Error("userId query parameter is required.");
  return userId;
};

export const getLearningPath = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await learningPathService.getOrGenerateLearningPath(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const completeMilestone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { milestoneId } = req.params;
    if (!milestoneId) throw new Error("milestoneId is required");
    
    const data = await learningPathService.completeMilestone(getUserId(req), milestoneId as string);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getCuratedResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { milestoneId } = req.params;
    if (!milestoneId) throw new Error("milestoneId is required");

    const data = await getCuratedResourcesForMilestone(getUserId(req), milestoneId as string);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdaptiveDecision = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { getAdaptiveLearningDecision } = await import("../services/adaptive-learning.service.js");
    const data = await getAdaptiveLearningDecision(getUserId(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

