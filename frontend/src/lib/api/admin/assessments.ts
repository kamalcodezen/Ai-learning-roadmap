import { serverFetch } from "../../core/server";

export interface AdminAssessmentItem {
  id: string;
  targetRole: string;
  status: string;
  score?: number;
  userId: string;
  startedAt: string;
  completedAt?: string;
  user?: {
    name?: string;
    email?: string;
  };
}

export interface AdminAssessmentsResponse {
  attempts: AdminAssessmentItem[];
  total: number;
  completed: number;
  averageScore: number;
}

/**
 * Fetches platform-wide learner diagnostic assessments, pass rates, and completion scores.
 */
export const getAdminAssessments = async (
  userId: string,
  skip = 0,
  take = 20,
  search = "",
  status = "",
  days?: number
): Promise<AdminAssessmentsResponse> => {
  let url = `/api/admin/assessments?userId=${userId}&skip=${skip}&take=${take}`;
  if (search) url += `&search=${search}`;
  if (status) url += `&status=${status}`;
  if (days) url += `&days=${days}`;
  return await serverFetch(url);
};
