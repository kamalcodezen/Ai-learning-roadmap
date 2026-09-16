import { serverFetch } from "../../core/server";

export interface AdminSkillHealthItem {
  name: string;
  averageScore: number;
  usersCount: number;
}

export interface AdminSkillHealthResponse {
  allSkills: AdminSkillHealthItem[];
  strongSkills: AdminSkillHealthItem[];
  weakSkills: AdminSkillHealthItem[];
}

/**
 * Fetches platform-wide skill decay indices and learner competency distributions.
 */
export const getAdminSkillHealth = async (
  userId: string
): Promise<AdminSkillHealthResponse> => {
  return await serverFetch(`/api/admin/skill-health?userId=${userId}`);
};
