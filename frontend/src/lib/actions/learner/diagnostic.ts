import { serverMutation } from "../../core/server";

// ============================================================
// DIAGNOSTIC ATTEMPT
// ============================================================

export type DiagnosticAttempt = {
  id: string;
  userId: string;
  status: "IN_PROGRESS" | "COMPLETED";
  totalQuestions: number;
  answeredQuestions: number;
  score: number | null;
  startedAt: string;
  completedAt: string | null;
};

export type DiagnosticAttemptResponse = {
  success: boolean;
  message: string;
  data: DiagnosticAttempt;
};

// ============================================================
// DIAGNOSTIC ANSWER
// ============================================================

export type DiagnosticAnswerPayload = {
  questionId: string;
  selectedAnswer: string;
};

export type DiagnosticAnswer = {
  id: string;
  attemptId: string;
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  createdAt: string;
};

export type DiagnosticAnswerResponse = {
  success: boolean;
  message: string;
  data: DiagnosticAnswer;
};

// ============================================================
// DIAGNOSTIC COMPLETE
// ============================================================

export type DiagnosticCompleteResult = {
  id: string;
  userId: string;
  status: "COMPLETED";
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  score: number;
  startedAt: string;
  completedAt: string;
};

export type DiagnosticCompleteResponse = {
  success: boolean;
  message: string;
  data: DiagnosticCompleteResult;
};

// ============================================================
// CREATE DIAGNOSTIC ATTEMPT
// ============================================================

export const createDiagnosticAttempt = async (
  userId: string,
): Promise<DiagnosticAttemptResponse> => {
  return serverMutation("/api/diagnostic/attempts", {
    userId,
  });
};

// ============================================================
// SUBMIT DIAGNOSTIC ANSWER
// ============================================================

export const submitDiagnosticAnswer = async (
  attemptId: string,
  data: DiagnosticAnswerPayload,
): Promise<DiagnosticAnswerResponse> => {
  return serverMutation(`/api/diagnostic/attempts/${attemptId}/answers`, data);
};

// ============================================================
// COMPLETE DIAGNOSTIC ATTEMPT
// ============================================================

export const completeDiagnosticAttempt = async (
  attemptId: string,
): Promise<DiagnosticCompleteResponse> => {
  return serverMutation(`/api/diagnostic/attempts/${attemptId}/complete`);
};
