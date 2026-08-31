import { serverFetch } from "../../core/server";

export const getAdminCareerReadiness = async (userId: string) => {
  return await serverFetch(`/api/admin/career-readiness?userId=${userId}`);
};
