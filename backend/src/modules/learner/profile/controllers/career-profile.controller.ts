import type { Request, Response, NextFunction } from "express";
import prisma from "../../../../lib/prisma.js";

import { careerProfileSchema } from "../schemas/career-profile.schema.js";
import { upsertCareerProfile } from "../services/career-profile.service.js";

export const createOrUpdateCareerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Force userId from authenticated session
    req.body.userId = req.userId as string;
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

export const getRoutingState = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;

    const careerProfile = await prisma.careerProfile.findUnique({
      where: { userId },
    });

    const diagnosticAttempt = await prisma.diagnosticAttempt.findFirst({
      where: { userId, status: 'COMPLETED' },
    });

    return res.status(200).json({
      success: true,
      data: {
        onboardingCompleted: !!careerProfile,
        diagnosticCompleted: !!diagnosticAttempt,
      },
    });
  } catch (error) {
    console.error('[Routing State Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch routing state.' });
  }
};

