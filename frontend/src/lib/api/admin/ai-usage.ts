import { serverFetch } from "../../core/server";

export const getAdminAiUsage = async (userId: string, skip = 0, take = 20) => {
  return await serverFetch(`/api/admin/ai-usage?userId=${userId}&skip=${skip}&take=${take}`);
};
