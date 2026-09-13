import { serverFetch } from "../../core/server";

export interface JobRealitySkill {
  name: string;
  normalizedName?: string;
  jobsMentioning: number;
  totalJobs: number;
  demandScore: number; // percentage
  learnerScore: number;
  gap: number;
  importance: "high" | "medium" | "low";
  status: "Ready" | "Critical Gap" | "High Gap" | "Moderate Gap";
  category?: string;
}

export interface JobRealityRecommendation {
  text: string;
  actionType?: "LEARNING_PATH" | "GENERATE_PROJECT" | "SIMULATION" | "GENERAL";
  targetSkill?: string;
  href?: string;
}

export interface JobRealityData {
  targetRole: string;
  selectedLocation: string;
  market: {
    demandLevel: string; // "High" | "Medium" | "Low" | "Insufficient Data"
    jobCount: number; // Count of relevant listings analysed
    rawFetchedCount?: number;
    relevantCount?: number;
    trend: string | null; // "Growing" | "Stable" | "Declining" | "Insufficient Data"
    updatedAt: string;
    sampleStatus?: string;
    lowSampleSize?: boolean;
  };
  skills: JobRealitySkill[];
  aiAnalysis?: {
    available: boolean;
    roleSummary?: string;
    recurringExpectations?: string[];
    commonTools?: string[];
    experienceExpectations?: string[];
  } | null;
  insights: string[];
  recommendations: JobRealityRecommendation[];
  source: {
    provider: string;
    fetchedAt: string;
    location: string;
    cached: boolean;
    isFallback?: boolean;
    noData?: boolean;
  };
}

export const getJobReality = async (location?: string): Promise<JobRealityData> => {
  const query = location && location !== "all" ? `?location=${encodeURIComponent(location)}` : "";
  const response = await serverFetch(`/api/job-reality${query}`);
  return response.data;
};
