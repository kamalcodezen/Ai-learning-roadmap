import { serverFetch } from "../../core/server";

export interface RequirementItem {
  skill: string;
  importance: "High" | "Medium" | "Low";
  status: "acquired" | "learning" | "missing";
  score?: number;
  knowledgeScore?: number;
  practiceScore?: number;
  projectScore?: number;
  evidenceScore?: number;
}

export interface SeniorityBenchmarks {
  junior: number;
  mid: number;
  senior: number;
}

export interface AlignmentData {
  targetRole: string;
  roleDescription?: string;
  matchPercentage: number;
  seniorityBenchmarks?: SeniorityBenchmarks;
  experienceLevel?: string;
  defaultSeniority?: "junior" | "mid" | "senior";
  strongSkills: string[];
  developingSkills: string[];
  missingSkills: string[];
  criticalGaps: string[];
  requirements: RequirementItem[];
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
