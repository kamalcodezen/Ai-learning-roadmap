import { serverFetch } from "../../core/server";

export interface AdminProjectItem {
  id: string;
  title: string;
  description?: string | null;
  score?: number | null;
  repositoryUrl?: string | null;
  liveUrl?: string | null;
  projectType?: string; // GENERATED | IMPORTED
  isVerified?: boolean;
  techStack?: string[];
  userId: string;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface AdminProjectsResponse {
  projects: AdminProjectItem[];
  total: number;
}

/**
 * Fetches platform-wide learner project submissions, repository links, and verification scores.
 */
export const getAdminProjects = async (
  userId: string,
  skip = 0,
  take = 20,
  search = "",
  days?: number
): Promise<AdminProjectsResponse> => {
  let url = `/api/admin/projects?userId=${userId}&skip=${skip}&take=${take}&search=${search}`;
  if (days) url += `&days=${days}`;
  return await serverFetch(url);
};
