import { serverFetch, serverMutation } from "../../core/server";

export interface PlannedVsActualItem {
  requirement: string;
  expected: string;
  evidenceFound: string;
  status: "Verified" | "Partially Verified" | "Not Found" | "Unable to Verify";
}

export interface ProjectSpecification {
  title: string;
  summary?: string;
  primaryLearningObjective?: string;
  generatedForContext?: string;
  problemBeingSolved?: string;
  whyItMatters?: string;
  coreRequirements?: string[];
  expectedFunctionality?: string[];
  recommendedTechStack?: string[];
  skillsDemonstrated?: string[];
  expectedDeliverables?: string[];
  suggestedArchitecture?: string[];
  verificationExpectations?: string[];
  expectedEvidence?: Array<{ requirement: string; filePattern: string }>;
}

export interface AiSummaryData {
  type?: string;
  summary?: string;
  projectPurpose?: string;
  problemSolved?: string;
  plannedStack?: string[];
  mainFeatures?: string[];
  actualTechnologies?: string[];
  detectedTechStack?: string[];
  mainComponents?: string[];
  architectureComponents?: string[];
  architecture?: string;
  engineeringDecisions?: string[];
  testing?: string;
  testingStatus?: string;
  ciCd?: string;
  ciCdStatus?: string;
  deployment?: string;
  deploymentStatus?: string;
  documentation?: string;
  documentationQuality?: string;
  strengths?: string[];
  missingAreas?: string[];
  areasForImprovement?: string[];
  completenessPercentage?: number;
  evidenceNote?: string | null;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  projectType: "GENERATED" | "IMPORTED";
  specification?: ProjectSpecification | null;
  aiSummary?: AiSummaryData | null;
  plannedVsActual?: PlannedVsActualItem[] | null;
  techStack: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  aiReview?: {
    reviewSource?: string;
    projectType?: "GENERATED" | "IMPORTED";
    overallScore: number;
    technicalQuality?: { score: number; feedback: string };
    practicalImplementation?: { score: number; feedback: string };
    problemSolving?: { score: number; feedback: string };
    architecture?: { score: number; feedback: string };
    documentation?: { score: number; feedback: string };
    completeness?: { score: number; feedback: string };
    technicalExplanation?: { score: number; feedback: string };
    evidenceQuality?: { score: number; feedback: string };
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    [key: string]: unknown;
  } | null;
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
  projectType?: "GENERATED" | "IMPORTED";
}

export interface ImportProjectInput {
  repositoryUrl: string;
  liveUrl?: string;
  title?: string;
  description?: string;
  techStack?: string[];
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

export const importProject = async (data: ImportProjectInput) => {
  const res = await serverMutation(`/api/portfolio/import`, data);
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

export const reanalyzeProject = async (projectId: string) => {
  const res = await serverMutation(`/api/portfolio/projects/${projectId}/reanalyze`, {}, "POST");
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

export interface GenerateProjectResponse {
  created: boolean;
  duplicate: boolean;
  project: ProjectData;
  data: ProjectData;
}

export const generateMilestoneProject = async (
  milestoneId?: string | null,
  skill?: string | null
): Promise<GenerateProjectResponse> => {
  const query = skill ? `?skill=${encodeURIComponent(skill)}` : "";
  const endpoint = milestoneId
    ? `/api/portfolio/milestone-project/${milestoneId}${query}`
    : `/api/portfolio/generate${query}`;

  const res = await serverMutation(endpoint, { skill }, "POST");
  const proj: ProjectData = res.project || res.data;
  return {
    created: res.created ?? true,
    duplicate: res.duplicate ?? false,
    project: proj,
    data: proj,
  };
};

export const reviewProjectPullRequest = async (projectId: string, prUrl: string) => {
  const res = await serverMutation(`/api/portfolio/projects/${projectId}/pr-review`, { prUrl }, "POST");
  return res.data;
};
