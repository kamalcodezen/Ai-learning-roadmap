import { serverFetch } from "../../core/server";

export interface CareerTwinData {
  targetRole: string;
  experienceLevel: string;
  readinessScore: number;
  scores: {
    knowledge: number;
    practical: number;
    projects: number;
    evidence: number;
    communication: number | string;
    interview: number;
  };
  communicationEvaluation?: Record<string, unknown>;
  strongSkills: string[];
  weakSkills: string[];
  currentFocus: string;
  careerGaps: string[];
  recommendedAction: {
    title: string;
    description: string;
    actionLabel: string;
    href: string;
  };
}

/**
 * Retrieves the Career Twin profile data.
 */
export const getCareerTwin = async (): Promise<CareerTwinData> => {
  return await serverFetch(`/api/career-twin`);
};
