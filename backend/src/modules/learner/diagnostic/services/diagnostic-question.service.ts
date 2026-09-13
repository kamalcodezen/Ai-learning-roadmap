import prisma from "../../../../lib/prisma.js";
import type { DiagnosticQuestionsQuery } from "../schemas/diagnostic-question.schema.js";
import { generateDiagnosticQuestions } from "./diagnostic-ai.service.js";
import { getSkillGaps } from "../../skill-gaps/services/skill-gaps.service.js";

// Concurrency guard: prevents duplicate AI generation requests for the same user
const inFlightGenerations = new Map<string, Promise<any>>();

export const getDiagnosticQuestions = async (query: DiagnosticQuestionsQuery) => {
  const { userId } = query;

  // If a generation is already in-flight for this user, await the same promise
  if (inFlightGenerations.has(userId)) {
    return inFlightGenerations.get(userId)!;
  }

  const generationPromise = (async () => {
    // 1. Single optimized database context fetch
    const [
      careerProfile,
      activeRoadmap,
      skillStates,
      skillGapsResult,
      existingAttempt,
    ] = await Promise.all([
      prisma.careerProfile.findUnique({
        where: { userId },
        select: {
          targetRole: true,
          targetRoleName: true,
          experienceLevel: true,
          weeklyAvailableHours: true,
        },
      }),
      prisma.roadmap.findFirst({
        where: { userId, status: "ACTIVE" },
        select: { targetRole: true },
      }),
      prisma.skillState.findMany({
        where: { userId },
        select: {
          skillName: true,
          knowledgeScore: true,
          practiceScore: true,
        },
      }),
      getSkillGaps(userId).catch(() => ({ gaps: [] as any[], overallHealth: 0 })),
      prisma.diagnosticAttempt.findFirst({
        where: {
          userId,
          status: "IN_PROGRESS",
        },
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
        },
      }),
    ]);

    if (!careerProfile) {
      throw new Error("Career profile not found. Please complete onboarding.");
    }

    const targetRole =
      activeRoadmap?.targetRole ||
      careerProfile.targetRoleName ||
      careerProfile.targetRole ||
      "Full Stack Developer";

    // 2. Check for active IN_PROGRESS attempt for current targetRole with all 6 questions
    if (
      existingAttempt &&
      existingAttempt.questions.length === 6 &&
      (!existingAttempt.targetRole || existingAttempt.targetRole === targetRole)
    ) {
      // Reuse persisted questions immediately (0 AI calls)
      return existingAttempt.questions.map((q) => {
        const { correctAnswer, ...rest } = q;
        return {
          ...rest,
          attemptId: existingAttempt.id,
        };
      });
    }

    // If an incomplete or obsolete attempt exists, invalidate it
    if (existingAttempt) {
      await prisma.diagnosticAttempt.update({
        where: { id: existingAttempt.id },
        data: { status: "ABANDONED" },
      });
    }

    // 3. Compile dynamic learner context from real database entities
    const knownSkills = skillStates.map(
      (s) =>
        `${s.skillName} (${Math.round((s.knowledgeScore + s.practiceScore) / 2)}%)`,
    );

    const gaps = Array.isArray(skillGapsResult?.gaps)
      ? skillGapsResult.gaps.map((g: any) => `${g.skill} (${g.severity || "moderate"})`)
      : [];

    const criticalGaps = Array.isArray(skillGapsResult?.gaps)
      ? skillGapsResult.gaps
          .filter((g: any) => g.severity === "critical" || g.severity === "moderate")
          .map((g: any) => g.skill)
          .join(", ")
      : "";

    // 4. Generate questions using fast single AI call (5 MCQs + 1 Communication question)
    const aiQuestions = await generateDiagnosticQuestions({
      targetRole,
      experienceLevel: careerProfile.experienceLevel,
      weeklyAvailableHours: careerProfile.weeklyAvailableHours || 10,
      knownSkills,
      skillGaps: gaps,
      weakAreas: criticalGaps,
    });

    // 5. Create new DiagnosticAttempt
    const attempt = await prisma.diagnosticAttempt.create({
      data: {
        userId,
        targetRole,
        status: "IN_PROGRESS",
        totalQuestions: 6,
      },
    });

    // 6. Persist all 6 questions linked to the attempt
    const questionData = aiQuestions.map((q, index) => ({
      attemptId: attempt.id,
      question: q.question,
      description: q.description || "",
      category: q.category,
      skill: q.skill,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      order: index + 1,
      isActive: true,
    }));

    await prisma.diagnosticQuestion.createMany({
      data: questionData,
    });

    const savedQuestions = await prisma.diagnosticQuestion.findMany({
      where: { attemptId: attempt.id },
      orderBy: { order: "asc" },
    });

    // Invalidate any other IN_PROGRESS attempts for this user
    await prisma.diagnosticAttempt.updateMany({
      where: {
        userId,
        status: "IN_PROGRESS",
        id: { not: attempt.id },
      },
      data: { status: "ABANDONED" },
    });

    // 7. Return safe question objects with attemptId attached
    return savedQuestions.map((q) => {
      const { correctAnswer, ...rest } = q;
      return {
        ...rest,
        attemptId: attempt.id,
      };
    });
  })();

  inFlightGenerations.set(userId, generationPromise);

  try {
    return await generationPromise;
  } finally {
    inFlightGenerations.delete(userId);
  }
};
