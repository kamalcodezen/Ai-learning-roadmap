import type { Request, Response, NextFunction } from "express";
import * as assessmentsService from "../services/assessments.service.js";
import * as skillSimulationService from "../services/skill-simulation.service.js";

const getUserId = (req: Request) => {
  const userId = req.userId as string;
  if (!userId) throw new Error("Authenticated userId is required.");
  return userId;
};

export const getAssessments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await assessmentsService.getAssessments(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getSkillSimulation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const skill = req.query.skill as string;
    if (!skill || !skill.trim()) {
      return res.status(400).json({ error: "Skill query parameter is required." });
    }

    const data = await skillSimulationService.getSkillSimulation(userId, skill.trim());
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const submitSkillSimulation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { skill, answers } = req.body;

    if (!skill || typeof skill !== "string") {
      return res.status(400).json({ error: "Skill is required in request body." });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Answers object is required." });
    }

    const { understandAnswer, debugAnswer, codeAnswer, explainAnswer } = answers;

    const result = await skillSimulationService.submitSkillSimulation(userId, skill.trim(), {
      understandAnswer: String(understandAnswer || ""),
      debugAnswer: String(debugAnswer || ""),
      codeAnswer: String(codeAnswer || ""),
      explainAnswer: String(explainAnswer || ""),
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getSkillSimulationResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const skill = req.query.skill as string;

    if (!skill || !skill.trim()) {
      return res.status(400).json({ error: "Skill query parameter is required." });
    }

    const result = await skillSimulationService.getLatestSkillSimulationResult(userId, skill.trim());
    if (!result) {
      return res.status(404).json({ error: `No assessment result found for skill ${skill}.` });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};
