import { serverFetch } from "../../core/server";

export interface AdminCareerReadinessTier {
  role: string;
  readyCount: number;
  progressingCount: number;
  averageScore: number;
}

export interface AdminCareerReadinessResponse {
  tiers: AdminCareerReadinessTier[];
  overallReadinessRate: number;
}

/**
 * Fetches platform aggregate learner career readiness scores and market velocity benchmarks.
 */
export const getAdminCareerReadiness = async (
  userId: string
): Promise<AdminCareerReadinessResponse> => {
  return await serverFetch(`/api/admin/career-readiness?userId=${userId}`);
};
