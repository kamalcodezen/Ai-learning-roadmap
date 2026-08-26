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

  // 5. Check duplicate answer
  const existingAnswer = await prisma.diagnosticAnswer.findUnique({
    where: {
      attemptId_questionId: {
        attemptId,
        questionId: data.questionId,
      },
    },
  });

  if (existingAnswer) {
    throw new Error("This question has already been answered.");
  }

  // 6. Check correct answer
  const isCorrect =
    data.selectedAnswer.trim() === question.correctAnswer.trim();

  // 7. Save answer
  const answer = await prisma.diagnosticAnswer.create({
    data: {
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
