import { serverFetch } from "../../core/server";

export const getAdminSkillProof = async (userId: string, skip = 0, take = 20, search = '') => {
  return await serverFetch(`/api/admin/skill-proof?userId=${userId}&skip=${skip}&take=${take}&search=${search}`);
};
