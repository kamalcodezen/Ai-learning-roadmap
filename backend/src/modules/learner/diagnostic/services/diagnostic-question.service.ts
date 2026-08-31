import prisma from "../../../../lib/prisma.js";
import type { DiagnosticQuestionsQuery } from "../schemas/diagnostic-question.schema.js";
import { generateDiagnosticQuestions } from "./diagnostic-ai.service.js";

export const getDiagnosticQuestions = async (query: DiagnosticQuestionsQuery) => {
  const { userId } = query;

  // 1. Fetch user's CareerProfile
  const careerProfile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  if (!careerProfile) {
    throw new Error("Career profile not found. Please complete onboarding.");
  }

  // 2. Check for an active IN_PROGRESS attempt for the current targetRole
  const existingAttempt = await prisma.diagnosticAttempt.findFirst({
    where: {
      userId,
      status: "IN_PROGRESS",
      targetRole: careerProfile.targetRole,
    },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (existingAttempt && existingAttempt.questions.length === 5) {
    // We already have cached personalized questions for this role
    return existingAttempt.questions.map((q) => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });
  }

  // 3. We should generate new questions using AI
  const aiQuestions = await generateDiagnosticQuestions({
    targetRole: careerProfile.targetRole,
    experienceLevel: careerProfile.experienceLevel,
    weeklyAvailableHours: 10,
  });

  // 4. Create a new DiagnosticAttempt
  const attempt = await prisma.diagnosticAttempt.create({
    data: {
      userId,
      targetRole: careerProfile.targetRole,
      status: "IN_PROGRESS",
      totalQuestions: 5,
    },
  });

  // 5. Save the 5 questions linked to the new attempt
  const savedQuestions = [];
  let order = 1;

  for (const q of aiQuestions) {
    const saved = await prisma.diagnosticQuestion.create({
      data: {
        attemptId: attempt.id,
        question: q.question,
        description: q.description || "",
        category: q.category,
        skill: q.skill,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        order: order++,
        isActive: true,
      },
    });
    savedQuestions.push(saved);
  }

  // Invalidate any other IN_PROGRESS attempts for this user
  await prisma.diagnosticAttempt.updateMany({
    where: {
      userId,
      status: "IN_PROGRESS",
      id: { not: attempt.id },
    },
    data: { status: "ABANDONED" },
  });

  return savedQuestions.map((q) => {
    const { correctAnswer, ...rest } = q;
    return rest;
  });
};
