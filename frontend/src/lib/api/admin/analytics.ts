import { serverFetch } from "../../core/server";

export const getAdminAnalytics = async (userId: string, days: number = 30) => {
  return await serverFetch(`/api/admin/analytics?userId=${userId}&days=${days}`);
};
