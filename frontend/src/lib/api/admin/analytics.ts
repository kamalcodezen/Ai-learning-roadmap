import { serverFetch } from "../../core/server";

export interface AdminAnalyticsResponse {
  overview?: {
    totalUsers?: number;
    activeLearners?: number;
    totalRoadmaps?: number;
    completedRoadmaps?: number;
  };
  charts?: {
    userGrowth?: Array<{ date: string; users: number }>;
    aiActivity?: Array<{ date: string; requests: number }>;
    assessmentScores?: Array<{ category: string; averageScore: number }>;
  };
}

/**
 * Fetches platform-wide aggregate growth metrics and chart datasets.
 */
export const getAdminAnalytics = async (
  userId: string,
  days: number = 30
): Promise<AdminAnalyticsResponse> => {
  return await serverFetch(`/api/admin/analytics?userId=${userId}&days=${days}`);
};
