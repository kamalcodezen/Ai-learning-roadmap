import { serverFetch } from "../../core/server";

export interface ReadinessCategory {
  id: string;
  name: string;
  score: number;
  status: "strong" | "needs_improvement" | "critical" | "missing";
  reason: string;
  recommendation: string;
}

export interface ReadinessDimensions {
  overallReadiness: number;
  knowledgeProficiency: number | "NOT_ASSESSED";
  practicalCompetence: number | "NOT_ASSESSED";
  projectExecution: number | "NOT_ASSESSED";
  problemSolving: number | "NOT_ASSESSED";
  communication: number | "NOT_ASSESSED";
  interviewPreparedness: number | "NOT_ASSESSED";
}

export interface ApplicationReadinessData {
  overallScore: number;
  isReady: boolean;
  dimensions?: ReadinessDimensions;
  categories: ReadinessCategory[];
}

/**
 * Retrieves the Application Readiness analysis data.
 */
export const getApplicationReadiness = async (): Promise<ApplicationReadinessData> => {
  try {
    return await serverFetch(`/api/application-readiness`);
  } catch (error) {
    console.error("Failed to fetch application readiness:", error);
    throw error;
  }
};
