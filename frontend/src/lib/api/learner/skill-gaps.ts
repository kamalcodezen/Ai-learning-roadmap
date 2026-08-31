import { serverFetch } from "../../core/server";

export interface SkillGap {
  id: string;
  skill: string;
  score: number;
  severity: "critical" | "moderate" | "low";
  reason: string;
  evidence: string;
  relatedAssessment: string;
  recommendedAction: string;
  href: string;
}

export interface SkillGapsData {
  overallHealth: number;
  criticalGaps: number;
  moderateGaps: number;
  strongSkills: number;
  gaps: SkillGap[];
}

/**
 * Retrieves the Skill Gaps analysis data.
 */
export const getSkillGaps = async (): Promise<SkillGapsData> => {
  return await serverFetch(`/api/skill-gaps`);
};
