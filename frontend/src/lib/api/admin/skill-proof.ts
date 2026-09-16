import { serverFetch } from "../../core/server";

export interface AdminSkillProofItem {
  id: string;
  projectId: string;
  userId: string;
  skillName: string;
  evidenceType: string;
  url: string;
  createdAt: string;
  user?: {
    name?: string;
    email?: string;
  };
}

export interface AdminSkillProofResponse {
  evidence: AdminSkillProofItem[];
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
