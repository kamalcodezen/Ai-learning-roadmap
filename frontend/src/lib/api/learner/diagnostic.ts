import { serverFetch } from "../../core/server";

// ============================================================
// DIAGNOSTIC QUESTION
// ============================================================

export type DiagnosticQuestion = {
  id: string;
  question: string;
  description: string;
  category: string;
  skill: string;
  options: string[];
  difficulty: string;
  order: number;
  attemptId?: string;
};

export type DiagnosticQuestionsResponse = {
  success: boolean;
  message: string;
  data: DiagnosticQuestion[];
};

// ============================================================
// DIAGNOSTIC RESULT TYPES
// ============================================================

export type DiagnosticSkillScore = {
  skill: string;
  category: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  status: "STRONG" | "MEDIUM" | "WEAK";
  gapLevel: "HIGH" | "MEDIUM" | "NONE";
};

export type CommunicationEvaluationDetails = {
  isAvailable: boolean;
  score: number;
  clarity: number;
  structure: number;
  technicalExplanation: number;
  relevance: number;
  completeness: number;
  feedback: string;
  transcript: string;
  question: string;
};

export type DiagnosticSkillGapItem = {
  skill: string;
  score: number;
  status: "STRONG" | "MEDIUM" | "WEAK";
  severity: "critical" | "moderate" | "none";
  gapLevel: "HIGH" | "MEDIUM" | "NONE";
  reason: string;
  evidence: string;
  recommendedAction: string;
  href: string;
};

export type DiagnosticRecommendationItem = {
  id: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  actionText: string;
  actionUrl: string;
  skillName?: string;
};

export type DiagnosticResultData = {
  id: string;
  userId: string;
  targetRole: string | null;
  status: string;
  totalQuestions: number;
  answeredQuestions: number;
  overallScore: number;
  score?: number; // alias for backward compatibility
  correctAnswers: number;
  mcqCount: number;
  startedAt: string;
  completedAt: string | null;
  skills: DiagnosticSkillScore[];
  strengths: DiagnosticSkillScore[];
  mediumSkills: DiagnosticSkillScore[];
  weakSkills: DiagnosticSkillScore[];
  skillGaps: DiagnosticSkillGapItem[];
  communication: CommunicationEvaluationDetails;
  recommendations: DiagnosticRecommendationItem[];
};

export type DiagnosticResultResponse = {
  success: boolean;
  message: string;
  data: DiagnosticResultData;
};

// ============================================================
// GET DIAGNOSTIC QUESTIONS
// ============================================================

export const getDiagnosticQuestions = async (
  userId: string,
  limit = 6,
): Promise<DiagnosticQuestionsResponse> => {
  return serverFetch(`/api/diagnostic/questions?limit=${limit}`);
};

// ============================================================
// GET DIAGNOSTIC RESULT BY ATTEMPT ID
// ============================================================

export const getDiagnosticResult = async (
  attemptId: string,
): Promise<DiagnosticResultResponse> => {
  return serverFetch(`/api/diagnostic/attempts/${attemptId}/result`);
};

// ============================================================
// GET LATEST DIAGNOSTIC RESULT
// ============================================================

export const getLatestDiagnosticResult = async (): Promise<DiagnosticResultResponse> => {
  return serverFetch(`/api/diagnostic/attempts/latest/result`);
};
