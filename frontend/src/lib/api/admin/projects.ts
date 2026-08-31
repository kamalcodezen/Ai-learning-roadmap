import { serverFetch } from "../../core/server";

export const getAdminProjects = async (userId: string, skip = 0, take = 20, search = '', days?: number) => {
  let url = `/api/admin/projects?userId=${userId}&skip=${skip}&take=${take}&search=${search}`;
  if (days) url += `&days=${days}`;
  return await serverFetch(url);
};
