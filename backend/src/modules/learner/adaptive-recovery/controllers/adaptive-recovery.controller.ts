import { Request, Response, NextFunction } from "express";
import * as roadmapSimService from "../services/roadmap-simulator.service.js";
import * as zeroGuiltService from "../services/zero-guilt-recovery.service.js";
import * as aiDependencyService from "../services/ai-dependency-meter.service.js";

export async function simulatePace(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as unknown as { user?: { id: string } }).user?.id || "guest";
    const weeklyHours = Number(req.query.hours) || 15;
    const result = await roadmapSimService.simulateRoadmapVelocity(userId, weeklyHours);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function savePace(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as unknown as { user?: { id: string } }).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const weeklyHours = Number(req.body.weeklyHours) || 15;
    const result = await roadmapSimService.saveWeeklyCommitment(userId, weeklyHours);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getRecoveryPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as unknown as { user?: { id: string } }).user?.id || "guest";
    const result = await zeroGuiltService.getZeroGuiltRecoveryPlan(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function claimBonus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as unknown as { user?: { id: string } }).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const result = await zeroGuiltService.claimResilienceBonus(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAIDependency(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as unknown as { user?: { id: string } }).user?.id || "guest";
    const result = await aiDependencyService.calculateAIDependencyMetrics(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
