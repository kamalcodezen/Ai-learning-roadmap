import { serverFetch } from "../../core/server";

export const getAdminErrorLogs = async (userId: string, skip = 0, take = 20) => {
  return await serverFetch(`/api/admin/error-logs?userId=${userId}&skip=${skip}&take=${take}`);
};
