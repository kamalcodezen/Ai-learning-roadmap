import { serverFetch } from "../../core/server";

export interface AdminJobRealityRoleItem {
  role: string;
  count: number;
}

export interface AdminJobRealityResponse {
  popularRoles: AdminJobRealityRoleItem[];
  totalChecks: number;
}

/**
 * Fetches platform-wide industry job demand calibration and skill alignment benchmarks.
 */
export const getAdminJobReality = async (
  userId: string
): Promise<AdminJobRealityResponse> => {
  return await serverFetch(`/api/admin/job-reality?userId=${userId}`);
};
