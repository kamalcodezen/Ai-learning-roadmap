import { serverFetch } from "../../core/server";

export const getAdminAssessments = async (userId: string, skip = 0, take = 20, search = '', status = '', days?: number) => {
  let url = `/api/admin/assessments?userId=${userId}&skip=${skip}&take=${take}`;
  if (search) url += `&search=${search}`;
  if (status) url += `&status=${status}`;
  if (days) url += `&days=${days}`;
  return await serverFetch(url);
};
