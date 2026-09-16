import { serverFetch } from "../../core/server";

export interface AdminJobRealityMarketTrack {
  roleName: string;
  demandLevel: "HIGH" | "MEDIUM" | "EMERGING";
  avgSalaryRange: string;
  topSkills: string[];
}

export interface AdminJobRealityResponse {
  marketTracks: AdminJobRealityMarketTrack[];
  totalCalibratedRoles: number;
}

/**
 * Fetches platform-wide industry job demand calibration and skill alignment benchmarks.
 */
export const getAdminJobReality = async (
  userId: string
): Promise<AdminJobRealityResponse> => {
  return await serverFetch(`/api/admin/job-reality?userId=${userId}`);
};
