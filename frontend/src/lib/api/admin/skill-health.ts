import { serverFetch } from "../../core/server";

export interface AdminSkillHealthCategory {
  skillName: string;
  averageScore: number;
  decayedCount: number;
  totalLearners: number;
}

export interface AdminSkillHealthResponse {
  skills: AdminSkillHealthCategory[];
  overallHealthScore: number;
}

/**
 * Fetches platform-wide skill decay indices and learner competency distributions.
 */
export const getAdminSkillHealth = async (
  userId: string
): Promise<AdminSkillHealthResponse> => {
  return await serverFetch(`/api/admin/skill-health?userId=${userId}`);
};
