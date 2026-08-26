import type { Request, Response, NextFunction } from "express";
import * as dashboardService from "../services/dashboard.service.js";
import * as learningPathService from "../services/learning-path.service.js";

// Utility to extract userId securely
const getUserId = (req: Request) => {
  const userId = req.query.userId as string;
  if (!userId) throw new Error("userId query parameter is required.");
  return userId;
};

export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getDashboardOverview(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getLearningPath = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await learningPathService.getOrGenerateLearningPath(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getCareerTwin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getCareerTwin(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getSkillGaps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getSkillGaps(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getProgress(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getProofGraph = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getProofGraph(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getAssessments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getAssessments(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getCareerAlignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getCareerAlignment(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getApplicationReadiness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getApplicationReadiness(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getPortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getPortfolio(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};
