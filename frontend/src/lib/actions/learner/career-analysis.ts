import { serverFetch, serverMutation } from "../../core/server";

export type CareerAnalysisSkill = {
  name: string;
  importance: "CORE" | "SUPPORTING";
  reason: string;
};

export type CareerAnalysisData = {
  role: string;
  domain: string;
  summary: string;
  coreSkills: CareerAnalysisSkill[];
  supportingSkills: CareerAnalysisSkill[];
  practicalCompetencies: string[];
  projectExpectations: string[];
  learningPriorities: string[];
};

export type CareerAnalysisResponse = {
  success: boolean;
  message: string;
  data: CareerAnalysisData | null;
};

export const fetchCareerAnalysis = async (): Promise<CareerAnalysisResponse> => {
  return serverFetch("/api/career-profile/analyze");
};

export const triggerCareerAnalysis = async (): Promise<CareerAnalysisResponse> => {
  return serverMutation("/api/career-profile/analyze", {});
};
