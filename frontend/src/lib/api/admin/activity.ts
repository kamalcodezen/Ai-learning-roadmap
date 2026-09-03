import { serverFetch } from "../../core/server";

export const getAdminActivity = async (userId: string, skip = 0, take = 20) => {
  return await serverFetch(`/api/admin/activity?userId=${userId}&skip=${skip}&take=${take}`);
};
