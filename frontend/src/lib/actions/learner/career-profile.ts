import { serverMutation } from "../../core/server";

export type CareerProfilePayload = {
  userId: string;
  targetRole: string;
  targetRoleName: string;
  experienceLevel: "BEGINNER" | "INTERMEDIATE";
  weeklyAvailableHours?: number;
};

export type CareerProfileData = {
  id: string;
  userId: string;
  targetRole: string;
  targetRoleName: string;
  experienceLevel: "BEGINNER" | "INTERMEDIATE";
  weeklyAvailableHours?: number;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CareerProfileResponse = {
  success: boolean;
  message: string;
  data: CareerProfileData;
};

export const onboardingCareerProfile = async (
  data: CareerProfilePayload,
): Promise<CareerProfileResponse> => {
  return serverMutation("/api/career-profile", data);
};

export const updateCareerProfile = async (
  data: Partial<CareerProfilePayload>,
): Promise<CareerProfileResponse> => {
  return serverMutation("/api/career-profile", data);
};
