import { serverFetch, serverMutation } from "../../core/server";

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  aiReview?: {
    overallScore: number;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    [key: string]: unknown;
  };
  metrics: {
    technicalDepth: number;
    explanationQuality: number;
    evidence: "verified" | "unverified" | "missing";
  };
}

export interface PortfolioData {
  overallStrength: number;
  projects: ProjectData[];
}

export interface ProjectInput {
  title: string;
  description: string;
  techStack: string[];
  repositoryUrl?: string;
  liveUrl?: string;
}

export const getPortfolio = async (): Promise<PortfolioData> => {
  const res = await serverFetch(`/api/portfolio`);
  return res.data;
};

export const getProject = async (projectId: string) => {
  const res = await serverFetch(`/api/portfolio/projects/${projectId}`);
  return res.data;
};

export const createProject = async (data: ProjectInput) => {
  const res = await serverMutation(`/api/portfolio/projects`, data);
  return res.data;
};

export const updateProject = async (projectId: string, data: Partial<ProjectInput>) => {
  const res = await serverMutation(`/api/portfolio/projects/${projectId}`, data, "PUT");
  return res.data;
};

export const deleteProject = async (projectId: string) => {
  const res = await serverMutation(`/api/portfolio/projects/${projectId}`, undefined, "DELETE");
  return res.data;
};

export const generateProjectReview = async (projectId: string) => {
  const res = await serverMutation(`/api/portfolio/projects/${projectId}/review`, {}, "POST");
  return res.data;
};

export const getProjectReview = async (projectId: string) => {
  const res = await serverFetch(`/api/portfolio/projects/${projectId}/review`);
  return res.data;
};

export const verifyProjectUrls = async (projectId: string) => {
  const res = await serverMutation(`/api/portfolio/projects/${projectId}/verify`, {}, "POST");
  return res.data;
};
