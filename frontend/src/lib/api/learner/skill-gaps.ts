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
  simulationHref?: string;
  learningPathHref?: string;
  isMilestoneCompleted?: boolean;
  milestoneTitle?: string | null;
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
