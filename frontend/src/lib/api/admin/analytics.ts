import { serverFetch } from "../../core/server";

export interface AdminAnalyticsOverview {
  users: number;
  roadmaps: number;
  projects: number;
  skills: number;
  assessments: number;
}

export interface AdminAnalyticsTimeSeries {
  users: Array<{ date: string; count: number }>;
  roadmaps: Array<{ date: string; count: number }>;
  projects: Array<{ date: string; count: number }>;
  assessments: Array<{ date: string; count: number }>;
}

export interface AdminAnalyticsResponse {
  overview: AdminAnalyticsOverview;
  timeSeries: AdminAnalyticsTimeSeries;
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
