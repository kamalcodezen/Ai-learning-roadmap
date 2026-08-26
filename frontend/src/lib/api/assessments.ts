import { serverFetch } from "../core/server";

export interface AssessmentItem {
  id: string;
  title: string;
  type: "diagnostic" | "skill_test" | "project_review";
  status: "completed" | "in_progress" | "not_started";
  score?: number;
  skillAssociated?: string;
  duration?: string;
  description: string;
  href: string;
}

export interface AssessmentsData {
  completedCount: number;
  averageScore: number;
  assessments: AssessmentItem[];
}

/**
 * Retrieves the Assessments dashboard data.
 */
export const getAssessments = async (userId: string): Promise<AssessmentsData> => {
  try {
    return await serverFetch(`/api/assessments?userId=${userId}`);
  } catch (error) {
    console.error("Failed to fetch assessments:", error);
    throw error;
  }
};
