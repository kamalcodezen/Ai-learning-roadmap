import { serverFetch } from "../core/server";

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
};

export type DiagnosticQuestionsResponse = {
  success: boolean;
  message: string;
  data: DiagnosticQuestion[];
};

// ============================================================
// GET DIAGNOSTIC QUESTIONS
// ============================================================

export const getDiagnosticQuestions = async (
  userId: string,
  limit = 5,
): Promise<DiagnosticQuestionsResponse> => {
  return serverFetch(`/api/diagnostic/questions?userId=${userId}&limit=${limit}`);
};
