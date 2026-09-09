import { serverFetch, serverMutation } from "../../core/server";

export interface AssessmentItem {
  id: string;
  title: string;
  type: "diagnostic" | "skill_test" | "project_review" | "interview" | string;
  status: "completed" | "in_progress" | "not_started";
  score?: number;
  skillAssociated?: string;
  duration?: string;
  description: string;
  href: string;
}

export interface AssessmentsData {
  completedCount: number;
  averageScore: number;
  assessments: AssessmentItem[];
}

export interface SimulationStageUnderstand {
  stage: "understand";
  title: string;
  question: string;
  context?: string;
  options: string[];
}

export interface SimulationStageDebug {
  stage: "debug";
  title: string;
  question: string;
  codeSnippet: string;
  options: string[];
}

export interface SimulationStageCode {
  stage: "code";
  title: string;
  question: string;
  starterCode: string;
  instructions: string[];
}

export interface SimulationStageExplain {
  stage: "explain";
  title: string;
  question: string;
  context?: string;
  placeholder?: string;
}

export interface SkillSimulationData {
  skill: string;
  targetRole?: string;
  difficulty?: string;
  title: string;
  description: string;
  stages: {
    understand: SimulationStageUnderstand;
    debug: SimulationStageDebug;
    code: SimulationStageCode;
    explain: SimulationStageExplain;
  };
}

export interface SimulationSubmissionPayload {
  skill: string;
  answers: {
    understandAnswer: string;
    debugAnswer: string;
    codeAnswer: string;
    explainAnswer: string;
  };
}

export interface SimulationResultData {
  skill: string;
  targetRole?: string;
  difficulty?: string;
  overallScore: number;
  stageBreakdown: {
    understand: number;
    debug: number;
    code: number;
    explain: number;
  };
  strongAreas: string[];
  needsPractice: string[];
  feedback: string;
  completedAt: string;
}

/**
 * Retrieves the Assessments dashboard data.
 */
export const getAssessments = async (): Promise<AssessmentsData> => {
  try {
    return await serverFetch(`/api/assessments`);
  } catch (error) {
    console.error("Failed to fetch assessments:", error);
    throw error;
  }
};

/**
 * Retrieves the 4-stage skill mastery simulation for a given skill.
 */
export const getSkillSimulation = async (skill: string): Promise<SkillSimulationData> => {
  try {
    return await serverFetch(`/api/assessments/simulation?skill=${encodeURIComponent(skill)}`);
  } catch (error) {
    console.error(`Failed to fetch skill simulation for ${skill}:`, error);
    throw error;
  }
};

/**
 * Submits the completed simulation answers for genuine evaluation.
 */
export const submitSkillSimulation = async (
  payload: SimulationSubmissionPayload
): Promise<SimulationResultData> => {
  try {
    return await serverMutation(`/api/assessments/simulation/submit`, payload, "POST");
  } catch (error) {
    console.error("Failed to submit skill simulation:", error);
    throw error;
  }
};

/**
 * Retrieves the latest simulation result for a given skill.
 */
export const getSkillSimulationResult = async (
  skill: string
): Promise<SimulationResultData> => {
  try {
    return await serverFetch(`/api/assessments/simulation/result?skill=${encodeURIComponent(skill)}`);
  } catch (error) {
    console.error(`Failed to fetch skill simulation result for ${skill}:`, error);
    throw error;
  }
};
