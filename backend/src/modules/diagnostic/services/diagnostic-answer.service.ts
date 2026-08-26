import prisma from "../../../lib/prisma.js";
import type { SubmitDiagnosticAnswerInput } from "../schemas/diagnostic-answer.schema.js";

export const submitDiagnosticAnswer = async (
  attemptId: string,
  data: SubmitDiagnosticAnswerInput,
) => {
  // 1. Check diagnostic attempt
  const attempt = await prisma.diagnosticAttempt.findUnique({
    where: {
      id: attemptId,
    },
  });

  if (!attempt) {
    throw new Error("Diagnostic attempt not found.");
  }

  // 2. Check attempt status
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("This diagnostic attempt is no longer active.");
  }

  // 3. Find diagnostic question
  const question = await prisma.diagnosticQuestion.findUnique({
    where: {
      id: data.questionId,
    },
  });

  if (!question) {
    throw new Error("Diagnostic question not found.");
  }

  // 4. Check question status
  if (!question.isActive) {
    throw new Error("This diagnostic question is no longer active.");
  }

  const isCorrect =
    data.selectedAnswer.trim() === question.correctAnswer.trim();

  // 5. Save or update answer (Upsert)
  // This prevents the "already answered" error if a user reloads the page and re-submits an answer for the same attempt.
  const answer = await prisma.diagnosticAnswer.upsert({
    where: {
      attemptId_questionId: {
        attemptId,
        questionId: data.questionId,
      },
    },
    update: {
      selectedAnswer: data.selectedAnswer.trim(),
      isCorrect,
    },
    create: {
      attemptId,
      questionId: data.questionId,
      selectedAnswer: data.selectedAnswer.trim(),
      isCorrect,
    },
  });

  // 8. Count answered questions
  const answeredQuestions = await prisma.diagnosticAnswer.count({
    where: {
      attemptId,
    },
  });

  // 9. Update diagnostic attempt
  await prisma.diagnosticAttempt.update({
    where: {
      id: attemptId,
    },

    data: {
      answeredQuestions,
    },
  });

  // 10. Return safe answer response
  return {
    id: answer.id,
    attemptId: answer.attemptId,
    questionId: answer.questionId,
    selectedAnswer: answer.selectedAnswer,
    isCorrect: answer.isCorrect,
    createdAt: answer.createdAt,
  };
};
