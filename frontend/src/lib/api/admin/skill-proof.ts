import { serverFetch } from "../../core/server";

export interface AdminSkillProofItem {
  id: string;
  userId: string;
  skillName: string;
  knowledgeScore: number;
  practiceScore: number;
  projectScore: number;
  evidenceScore: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  [key: string]: unknown;
}

export interface AdminSkillProofResponse {
  proofs: AdminSkillProofItem[];
  total: number;
}

/**
 * Fetches platform-wide learner verified evidence links, code proofs, and capstone artifacts.
 */
export const getAdminSkillProof = async (
  userId: string,
  skip = 0,
  take = 20,
  search = ""
): Promise<AdminSkillProofResponse> => {
  return await serverFetch(`/api/admin/skill-proof?userId=${userId}&skip=${skip}&take=${take}&search=${search}`);
};
