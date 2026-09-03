import { serverFetch } from "../../core/server";

export interface JobRealitySkill {
  name: string;
  demandScore: number;
  learnerScore: number;
  importance: "high" | "medium" | "low";
  gap: number;
}

export interface JobRealityData {
  targetRole: string;
  market: {
    demandLevel: string;
    jobCount: number | null;
    trend: string | null;
    updatedAt: string | null;
  };
  skills: JobRealitySkill[];
  insights: string[];
  recommendations: string[];
  source: {
    provider: string;
    fetchedAt: string;
    cached: boolean;
  };
}

export const getJobReality = async (): Promise<JobRealityData> => {
  const response = await serverFetch("/api/job-reality");
  return response.data;
};
