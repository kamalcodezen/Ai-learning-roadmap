import { serverFetch, serverMutation } from "../../core/server";

export interface Milestone {
  id: string;
  title: string;
  status: "completed" | "current" | "upcoming";
  progress?: number;
  skillsCovered: string[];
  estimatedTime: string;
  description: string;
  whyItMatters: string;
}

export interface LearningPathData {
  roadmapTitle: string;
  targetRole: string;
  overallProgress: number;
  milestones: Milestone[];
  nextAction: {
    title: string;
    href: string;
  };
}

export interface CuratedResource {
  id: string;
  title: string;
  type: "DOCUMENTATION" | "TUTORIAL" | "COURSE" | "ARTICLE" | "PRACTICE";
  url: string;
  provider: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  isOfficial: boolean;
}

export interface MilestoneResourcesResponse {
  success: boolean;
  data: {
    milestoneTitle: string;
    resources: CuratedResource[];
  };
}

/**
 * Retrieves the AI-generated Learning Path/Roadmap data.
 */
export const getLearningPath = async (): Promise<LearningPathData> => {
  return await serverFetch(`/api/learning-path`);
};

export const completeMilestone = async (milestoneId: string): Promise<LearningPathData> => {
  return await serverMutation(`/api/learning-path/${milestoneId}/complete`, undefined, "POST");
};

export interface AdaptiveLearningDecision {
  type: string;
  title: string;
  recommendation: string;
  reason: string;
  evidenceBasis: string;
  targetSkill?: string;
  targetMilestone?: {
    id: string;
    title: string;
  };
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  actionLabel: string;
  href: string;
}

export interface AdaptiveDecisionResponse {
  success: boolean;
  data: AdaptiveLearningDecision;
}

export const getMilestoneResources = async (milestoneId: string): Promise<MilestoneResourcesResponse> => {
  return await serverFetch(`/api/learning-path/milestones/${milestoneId}/resources`);
};

export const getAdaptiveLearningDecision = async (): Promise<AdaptiveDecisionResponse> => {
  return await serverFetch(`/api/learning-path/adaptive-decision`);
};

