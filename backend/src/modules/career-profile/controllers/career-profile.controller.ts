import type { Request, Response, NextFunction } from "express";

import { careerProfileSchema } from "../schemas/career-profile.schema.js";
import { upsertCareerProfile } from "../services/career-profile.service.js";

export const createOrUpdateCareerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsedData = careerProfileSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid career profile data",
        errors: parsedData.error.flatten(),
      });
    }

    const careerProfile = await upsertCareerProfile(parsedData.data);

    return res.status(200).json({
      success: true,
      message: "Career profile saved successfully",
      data: careerProfile,
    });
  } catch (error) {
    next(error);
  }
};
