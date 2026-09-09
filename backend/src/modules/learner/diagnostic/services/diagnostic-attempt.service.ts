import prisma from "../../../../lib/prisma.js";
import { getOrGenerateLearningPath } from "../../roadmap/services/learning-path.service.js";
import { isMatchingSkill } from "../../assessments/services/skill-simulation.service.js";

import type { CreateDiagnosticAttemptInput } from "../schemas/diagnostic-attempt.schema.js";

// ============================================================
// CREATE DIAGNOSTIC ATTEMPT
// ============================================================

export const createDiagnosticAttempt = async (
  data: CreateDiagnosticAttemptInput,
) => {
  // Onboarding diagnostic contains 5 MCQ + 1 Communication = 6 questions total.
  const totalQuestions = 6;

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
  let mcqCount = 0; // Only count MCQ questions (order 1-5) for the MCQ score
  const skillScores: Record<string, { total: number; correct: number }> = {};

  for (const answer of answers) {
    // Q6 is the open-ended communication question — exclude from MCQ score and SkillState
    const isMcq = answer.question.order !== 6;
    if (isMcq) {
      mcqCount++;
      if (answer.isCorrect) correctCount++;

      const skill = answer.question.skill?.trim() || "General";
      if (!skillScores[skill]) skillScores[skill] = { total: 0, correct: 0 };
      skillScores[skill].total++;
      if (answer.isCorrect) skillScores[skill].correct++;
    }
  }

  // Score is based on MCQ questions only (out of 5)
  const score = mcqCount > 0 ? Math.round((correctCount / mcqCount) * 100) : 0;

  await prisma.diagnosticAttempt.update({
    where: { id: attemptId },
    data: {
      status: "COMPLETED",
      answeredQuestions,
      score,
      completedAt: new Date(),
    },
  });

  // Upsert SkillState and Record History if changed
  const existingSkillStates = await prisma.skillState.findMany({
    where: { userId: attempt.userId },
  });

  for (const [skill, counts] of Object.entries(skillScores)) {
    if (counts.total === 0) continue;
    const knowledgeScore = Math.round((counts.correct / counts.total) * 100);
    
    // Check previous state (exact match or matching alias)
    const previousMatchingStates = existingSkillStates.filter(s => isMatchingSkill(s.skillName, skill));
    const previousState = previousMatchingStates.find(s => s.skillName === skill) || previousMatchingStates[0];

    // Upsert the state under the current diagnostic skill name
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

    // Also update any existing matching alias records to ensure consistency
    for (const prev of previousMatchingStates) {
      if (prev.skillName !== skill) {
        await prisma.skillState.update({
          where: { id: prev.id },
          data: {
            knowledgeScore,
            lastReviewed: new Date(),
          },
        });
      }
    }

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

  // Award XP and evaluate achievements asynchronously
  try {
    const { awardXp, evaluateAchievements } = await import(
      "../../gamification/services/gamification.service.js"
    );
    await awardXp(
      attempt.userId,
      "ASSESSMENT_COMPLETION",
      attempt.id,
      100,
      `Completed diagnostic assessment (${score}%)`,
    );
    await evaluateAchievements(attempt.userId);
  } catch (err) {
    console.error("Failed to award gamification XP for diagnostic:", err);
  }

  // Create real Notification
  try {
    const { createNotification } = await import("../../notifications/services/notification.service.js");
    await createNotification({
      userId: attempt.userId,
      type: "ASSESSMENT",
      title: "Diagnostic Assessment Completed",
      message: `You completed your baseline diagnostic assessment with a score of ${score}%.`,
      metadata: { attemptId, score },
    });
  } catch (err) {
    console.error("Failed to create diagnostic assessment notification:", err);
  }

  // Fetch and return the rich diagnostic result
  const { getDiagnosticResult } = await import("./diagnostic-result.service.js");
  const result = await getDiagnosticResult(attemptId, userId);

  return {
    ...result,
    score: result.overallScore, // Backward compatibility alias
  };
};
