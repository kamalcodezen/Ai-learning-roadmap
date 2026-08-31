import { serverFetch } from "../../core/server";

export interface ReadinessCategory {
  id: string;
  name: string;
  score: number;
  status: "strong" | "needs_improvement" | "critical" | "missing";
  reason: string;
  recommendation: string;
}

export interface ApplicationReadinessData {
  overallScore: number;
  isReady: boolean;
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
