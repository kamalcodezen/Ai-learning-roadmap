import { serverFetch } from "../../core/server";

export interface AdminResumeItem {
  id: string;
  userId: string;
  targetRole: string;
  fullName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  github?: string | null;
  linkedin?: string | null;
  summary: string;
  skills: unknown;
  experience: unknown;
  projects: unknown;
  education: unknown;
  certifications?: unknown;
  atsScore?: number | null;
  atsFeedback?: {
    score?: number;
    strengths?: string[];
    missingKeywords?: string[];
    suggestions?: string[];
    breakdown?: {
      formatting?: number;
      keywords?: number;
      impactMetrics?: number;
      relevance?: number;
    };
  } | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    plan: string;
  };
}

export interface AdminResumesResponse {
  resumes: AdminResumeItem[];
  total: number;
  summary: {
    totalResumes: number;
    averageAtsScore: number;
    highAtsCount: number;
  };
}

export const getAdminResumes = async (
  userId: string,
  skip = 0,
  take = 20,
  search = "",
  minScore?: number,
  days?: number
): Promise<AdminResumesResponse> => {
  let url = `/api/admin/resumes?userId=${userId}&skip=${skip}&take=${take}&search=${encodeURIComponent(search)}`;
  if (minScore !== undefined) url += `&minScore=${minScore}`;
  if (days) url += `&days=${days}`;
  return await serverFetch(url);
};

export const getAdminResumeDetails = async (
  userId: string,
  resumeId: string
): Promise<AdminResumeItem> => {
  return await serverFetch(`/api/admin/resumes/${resumeId}?userId=${userId}`);
};
