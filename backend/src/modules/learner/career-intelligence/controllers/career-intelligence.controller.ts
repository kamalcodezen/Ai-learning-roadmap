import type { Request, Response, NextFunction } from "express";
import { getCareerDecision } from "../services/career-decision-engine.service.js";
import { getSkillEvidenceVerification } from "../services/skill-evidence-verifier.service.js";

const getUserId = (req: Request): string => {
  const userId = req.userId as string;
  if (!userId) throw new Error("User authentication is required.");
  return userId;
};

export const getCareerDecisionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getCareerDecision(getUserId(req));
    res.status(200).json({
      success: true,
      message: "Career decision recommendation generated successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getEvidenceVerificationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getSkillEvidenceVerification(getUserId(req));
    res.status(200).json({
      success: true,
      message: "Skill evidence verification overview generated successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};
