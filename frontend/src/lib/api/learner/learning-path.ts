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

/**
 * Retrieves the AI-generated Learning Path/Roadmap data.
 */
export const getLearningPath = async (): Promise<LearningPathData> => {
  return await serverFetch(`/api/learning-path`);
};

export const completeMilestone = async (milestoneId: string): Promise<LearningPathData> => {
  return await serverMutation(`/api/learning-path/${milestoneId}/complete`, undefined, "POST");
};

