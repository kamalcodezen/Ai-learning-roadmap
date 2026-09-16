import { serverFetch } from "../../core/server";

export interface AdminRoadmapItem {
  id: string;
  targetRole: string;
  status: string;
  userId: string;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  milestones?: Array<{ status: string }>;
}

export interface AdminRoadmapsResponse {
  roadmaps: AdminRoadmapItem[];
  total: number;
}

/**
 * Fetches platform-wide learner learning path roadmaps with status and role filtering.
 */
export const getAdminRoadmaps = async (
  userId: string,
  skip = 0,
  take = 20,
  search = "",
  status = "",
  targetRole = ""
): Promise<AdminRoadmapsResponse> => {
  let url = `/api/admin/roadmaps?userId=${userId}&skip=${skip}&take=${take}`;
  if (search) url += `&search=${search}`;
  if (status) url += `&status=${status}`;
  if (targetRole) url += `&targetRole=${targetRole}`;
  return await serverFetch(url);
};
