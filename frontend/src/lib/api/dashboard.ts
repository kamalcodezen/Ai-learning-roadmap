import { DashboardData } from "@/src/components/dashboard/types";
import { serverFetch } from "../core/server";

/**
 * Retrieves the complete dashboard data for the authenticated user.
 */
export const getDashboardOverview = async (userId: string): Promise<DashboardData> => {
  return await serverFetch(`/api/dashboard?userId=${userId}`);
};
