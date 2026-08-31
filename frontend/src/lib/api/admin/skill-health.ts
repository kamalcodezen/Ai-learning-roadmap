import { serverFetch } from "../../core/server";

export const getAdminSkillHealth = async (userId: string) => {
  return await serverFetch(`/api/admin/skill-health?userId=${userId}`);
};
