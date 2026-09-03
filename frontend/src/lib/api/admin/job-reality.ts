import { serverFetch } from "../../core/server";

export const getAdminJobReality = async (userId: string) => {
  return await serverFetch(`/api/admin/job-reality?userId=${userId}`);
};
