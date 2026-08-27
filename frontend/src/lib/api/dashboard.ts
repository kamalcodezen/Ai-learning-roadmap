import { DashboardData } from "@/src/app/(dashboard)/dashboard/types";
import { serverFetch } from "../core/server";

/**
 * Retrieves the complete dashboard data for the authenticated user.
 */
export const getDashboardOverview = async (userId: string): Promise<DashboardData> => {
  return await serverFetch(`/api/dashboard?userId=${userId}`);
};
