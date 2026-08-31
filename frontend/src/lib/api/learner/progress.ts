import { serverFetch } from "../../core/server";

export interface ActivityItem {
  id: string;
  type: "learning" | "assessment" | "project";
  title: string;
  date: string;
  description: string;
}

export interface ProgressData {
  weeklyHours: number;
  monthlyHours: number;
  currentStreak: number;
  readinessTrend: number;
  recentActivity: ActivityItem[];
}

/**
 * Retrieves the Progress analytics data.
 */
export const getProgress = async (): Promise<ProgressData> => {
  return await serverFetch(`/api/progress`);
};
