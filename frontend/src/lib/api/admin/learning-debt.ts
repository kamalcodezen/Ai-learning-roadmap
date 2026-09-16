import { serverFetch } from "../../core/server";

export interface AdminLearningDebtRecord {
  id: string;
  userId: string;
  skillName: string;
  knowledgeScore: number;
  practiceScore: number;
  projectScore?: number;
  evidenceScore?: number;
  user: {
    name: string;
    email: string;
  };
  topic?: string;
  [key: string]: unknown;
}

export interface AdminLearningDebtResponse {
  debtRecords: AdminLearningDebtRecord[];
}

/**
 * Fetches platform aggregate curriculum debt, overdue concepts, and remediation queues.
 */
export const getAdminLearningDebt = async (
  userId: string
): Promise<AdminLearningDebtResponse> => {
  return await serverFetch(`/api/admin/learning-debt?userId=${userId}`);
};
