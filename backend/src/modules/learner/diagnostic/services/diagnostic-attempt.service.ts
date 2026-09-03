import prisma from "../../../../lib/prisma.js";
import { getOrGenerateLearningPath } from "../../roadmap/services/learning-path.service.js";

import type { CreateDiagnosticAttemptInput } from "../schemas/diagnostic-attempt.schema.js";

// ============================================================
// CREATE DIAGNOSTIC ATTEMPT
// ============================================================

export const createDiagnosticAttempt = async (
  data: CreateDiagnosticAttemptInput,
) => {
  // Onboarding diagnostic always contains 5 questions.
  const totalQuestions = 5;

  const attempt = await prisma.diagnosticAttempt.create({
    data: {
      userId: data.userId,
      status: "IN_PROGRESS",
      totalQuestions,
      answeredQuestions: 0,
      score: null,
    },
  });

  return attempt;
};

// ============================================================
// COMPLETE DIAGNOSTIC ATTEMPT
// ============================================================

export const completeDiagnosticAttempt = async (attemptId: string, userId: string) => {
  // 1. Fetch attempt and enforce ownership
  const attempt = await prisma.diagnosticAttempt.findFirst({
    where: {
      id: attemptId,
      userId: userId,
    },
  });

  if (!attempt) throw new Error("Diagnostic attempt not found.");
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("This diagnostic attempt is already completed or not active.");
  }

  const answers = await prisma.diagnosticAnswer.findMany({
    where: { attemptId },
    include: { question: true },
  });

  const answeredQuestions = answers.length;
  if (answeredQuestions !== attempt.totalQuestions) {
    throw new Error(`All ${attempt.totalQuestions} diagnostic questions must be answered.`);
  }

  let correctCount = 0;
  const skillScores: Record<string, { total: number; correct: number }> = {};

  for (const answer of answers) {
    if (answer.isCorrect) correctCount++;
    
    const skill = answer.question.skill;
    if (!skillScores[skill]) skillScores[skill] = { total: 0, correct: 0 };
    skillScores[skill].total++;
    if (answer.isCorrect) skillScores[skill].correct++;
  }

  const score = Math.round((correctCount / attempt.totalQuestions) * 100);

  const updatedAttempt = await prisma.diagnosticAttempt.update({
    where: { id: attemptId },
    data: {
      status: "COMPLETED",
      answeredQuestions,
      score,
      completedAt: new Date(),
    },
  });

  // Upsert SkillState and Record History if changed
  for (const [skill, counts] of Object.entries(skillScores)) {
    const knowledgeScore = Math.round((counts.correct / counts.total) * 100);
    
    // Check previous state
    const previousState = await prisma.skillState.findUnique({
      where: {
        userId_skillName: {
          userId: attempt.userId,
          skillName: skill,
        }
      }
    });

    // Upsert the new state
    const newState = await prisma.skillState.upsert({
      where: {
        userId_skillName: {
          userId: attempt.userId,
          skillName: skill,
        },
      },
      update: {
        knowledgeScore,
        lastReviewed: new Date(),
      },
      create: {
        userId: attempt.userId,
        skillName: skill,
        knowledgeScore,
      },
    });

    // Only create history if it's a new skill or the score actually changed
    if (!previousState || previousState.knowledgeScore !== knowledgeScore) {
      await prisma.skillStateHistory.create({
        data: {
          userId: attempt.userId,
          skillName: skill,
          knowledgeScore: newState.knowledgeScore,
          practiceScore: newState.practiceScore,
          projectScore: newState.projectScore,
          evidenceScore: newState.evidenceScore,
        }
      });
    }
  }

  // Trigger Roadmap Generation asynchronously
  getOrGenerateLearningPath(attempt.userId).catch((error: unknown) => {
    console.error("Failed to generate learning path asynchronously:", error);
  });

  // Record Activity Log
  await prisma.activityLog.create({
    data: {
      userId: attempt.userId,
      type: "ASSESSMENT",
      description: `Completed diagnostic assessment with score ${score}%`,
      metadata: { score, totalQuestions: attempt.totalQuestions },
    },
  });

  return {
    id: updatedAttempt.id,
    userId: updatedAttempt.userId,
    status: updatedAttempt.status,
    totalQuestions: updatedAttempt.totalQuestions,
    answeredQuestions: updatedAttempt.answeredQuestions,
    correctAnswers: correctCount,
    score: updatedAttempt.score,
    startedAt: updatedAttempt.startedAt,
    completedAt: updatedAttempt.completedAt,
  };
};
