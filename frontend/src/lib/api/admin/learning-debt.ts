import { serverFetch } from "../../core/server";

export interface AdminLearningDebtItem {
  skillName: string;
  overdueCount: number;
  criticalLearnersCount: number;
  averageDebtHours: number;
}

export interface AdminLearningDebtResponse {
  debtItems: AdminLearningDebtItem[];
  totalOverdueConcepts: number;
}

/**
 * Fetches platform aggregate curriculum debt, overdue concepts, and remediation queues.
 */
export const getAdminLearningDebt = async (
  userId: string
): Promise<AdminLearningDebtResponse> => {
  return await serverFetch(`/api/admin/learning-debt?userId=${userId}`);
};
