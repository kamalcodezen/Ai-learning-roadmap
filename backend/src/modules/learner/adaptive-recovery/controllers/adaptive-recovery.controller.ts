import type { Request, Response, NextFunction } from "express";
import {
  getRoadmapSimulation,
  updateRoadmapPace,
} from "../services/roadmap-simulator.service.js";
import {
  getZeroGuiltRecoveryStatus,
  activateZeroGuiltRecoveryPlan,
  completeZeroGuiltStep,
  dismissZeroGuiltRecovery,
} from "../services/zero-guilt-recovery.service.js";
import { getAiDependencyAnalysis } from "../services/ai-dependency-meter.service.js";

const getUserId = (req: Request): string => {
  const userId = req.userId as string;
  if (!userId) {
    throw new Error("Authentication required: userId not found in session.");
  }
  return userId;
};

/**
 * Returns a unified overview of all 3 Section #6 systems:
 * 1. Roadmap Simulator & Velocity
 * 2. Zero-Guilt Recovery Mode
 * 3. AI Dependency Meter & Interview Success Signals
 */
export const getAdaptiveRecoveryOverview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);

    const [simulator, recovery, aiDependency] = await Promise.all([
      getRoadmapSimulation(userId),
      getZeroGuiltRecoveryStatus(userId),
      getAiDependencyAnalysis(userId),
    ]);

    res.status(200).json({
      success: true,
      data: {
        simulator,
        recovery,
        aiDependency,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSimulatorData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const data = await getRoadmapSimulation(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updatePace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { weeklyHours } = req.body;

    if (typeof weeklyHours !== "number" || isNaN(weeklyHours)) {
      return res.status(400).json({
        success: false,
        message: "weeklyHours must be a valid number between 3 and 50.",
      });
    }

    const data = await updateRoadmapPace(userId, weeklyHours);
    res.status(200).json({
      success: true,
      message: `Roadmap pace updated to ${weeklyHours} hours/week successfully.`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecoveryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const data = await getZeroGuiltRecoveryStatus(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const startRecovery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const isSimulation = Boolean(req.body?.simulate);
    const data = await activateZeroGuiltRecoveryPlan(userId, isSimulation);
    res.status(200).json({
      success: true,
      message: "Zero-Guilt Recovery plan activated.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const completeStep = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const { dayIndex, notes } = req.body;

    if (typeof dayIndex !== "number" || dayIndex < 1 || dayIndex > 4) {
      return res.status(400).json({
        success: false,
        message: "dayIndex must be an integer between 1 and 4.",
      });
    }

    const data = await completeZeroGuiltStep(userId, dayIndex, notes);
    res.status(200).json({
      success: true,
      message: `Day ${dayIndex} completed successfully.`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const dismissRecovery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const data = await dismissZeroGuiltRecovery(userId);
    res.status(200).json({
      success: true,
      message: "Recovery banner dismissed.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAiDependency = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    const data = await getAiDependencyAnalysis(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
