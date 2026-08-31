import { serverFetch } from "../../core/server";

export interface AlignmentData {
  targetRole: string;
  matchPercentage: number;
  strongSkills: string[];
  missingSkills: string[];
  requirements: {
    skill: string;
    importance: "High" | "Medium" | "Low";
    status: "acquired" | "learning" | "missing";
  }[];
  recommendations: string[];
  nextAction: string;
  href: string;
}

/**
 * Retrieves the Career Alignment analysis data.
 */
export const getCareerAlignment = async (): Promise<AlignmentData> => {
  try {
    return await serverFetch(`/api/career-alignment`);
  } catch (error) {
    console.error("Failed to fetch career alignment:", error);
    throw error;
  }
};
