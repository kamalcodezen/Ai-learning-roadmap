import { serverFetch } from "../../core/server";

export const getAdminLearningDebt = async (userId: string) => {
  return await serverFetch(`/api/admin/learning-debt?userId=${userId}`);
};
