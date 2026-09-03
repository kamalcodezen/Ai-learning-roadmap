import type { Request, Response } from "express";
import * as jobRealityService from "./job-reality.service.js";

export const getLearnerJobReality = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const data = await jobRealityService.getLearnerJobReality(userId);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error("Job Reality Error:", error);
    
    if (error.message.includes("No target role")) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};
