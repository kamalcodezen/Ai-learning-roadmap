import { serverFetch } from "../../core/server";

export interface AdminCareerReadinessProfileItem {
  id: string;
  userId: string;
  targetRole: string;
  score: number;
  readinessScore?: number;
  assessmentsPassed?: number;
  user: {
    name: string;
    email: string;
  };
  [key: string]: unknown;
}

export interface AdminCareerReadinessSummary {
  ready: number;
  almost: number;
  needsWork: number;
  early: number;
  total: number;
}

export interface AdminCareerReadinessResponse {
  summary: AdminCareerReadinessSummary;
  profiles: AdminCareerReadinessProfileItem[];
}

/**
 * Fetches platform aggregate learner career readiness scores and market velocity benchmarks.
 */
export const getAdminCareerReadiness = async (
  userId: string
): Promise<AdminCareerReadinessResponse> => {
  return await serverFetch(`/api/admin/career-readiness?userId=${userId}`);
};
