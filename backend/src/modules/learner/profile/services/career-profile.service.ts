import prisma from "../../../../lib/prisma.js";
import type { CareerProfileInput } from "../schemas/career-profile.schema.js";

export const upsertCareerProfile = async (input: CareerProfileInput) => {
  const { userId, ...profileData } = input;

  // আগে নিশ্চিত করছি Better Auth-এর user database-এ আছে
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updateData: {
    targetRole: string;
    targetRoleName: string;
    experienceLevel: "BEGINNER" | "INTERMEDIATE";
    weeklyAvailableHours?: number;
  } = {
    targetRole: profileData.targetRole,
    targetRoleName: profileData.targetRoleName,
    experienceLevel: profileData.experienceLevel,
  };

  if (profileData.weeklyAvailableHours !== undefined) {
    updateData.weeklyAvailableHours = profileData.weeklyAvailableHours;
  }

  // Profile থাকলে update, না থাকলে create
  const careerProfile = await prisma.careerProfile.upsert({
    where: {
      userId,
    },
    update: updateData,
    create: {
      userId,
      targetRole: profileData.targetRole,
      targetRoleName: profileData.targetRoleName,
      experienceLevel: profileData.experienceLevel,
      weeklyAvailableHours: profileData.weeklyAvailableHours ?? 10,
    },
  });

  return careerProfile;
};
