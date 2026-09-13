import type { Request, Response } from "express";
import { getCareerAnalysis, generateCareerAnalysis } from "../services/career-analysis.service.js";

export const fetchCareerAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const analysis = await getCareerAnalysis(userId);
    
    return res.status(200).json({
      success: true,
      message: analysis ? "Career analysis retrieved" : "No analysis found",
      data: analysis,
    });
  } catch (error: any) {
    console.error("fetchCareerAnalysis error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const triggerCareerAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const analysis = await generateCareerAnalysis(userId);
    
    return res.status(200).json({
      success: true,
      message: "Career analysis generated successfully",
      data: analysis,
    });
  } catch (error: any) {
    console.error("triggerCareerAnalysis error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
