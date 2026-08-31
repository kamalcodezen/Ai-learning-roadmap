import { serverFetch } from "../../core/server";

export const getAdminRoadmaps = async (userId: string, skip = 0, take = 20, search = '', status = '', targetRole = '') => {
  let url = `/api/admin/roadmaps?userId=${userId}&skip=${skip}&take=${take}`;
  if (search) url += `&search=${search}`;
  if (status) url += `&status=${status}`;
  if (targetRole) url += `&targetRole=${targetRole}`;
  return await serverFetch(url);
};
