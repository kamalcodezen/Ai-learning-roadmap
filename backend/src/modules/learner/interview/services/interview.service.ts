import prisma from "../../../../lib/prisma.js";
import { generateInterviewQuestions, evaluateInterviewAnswer } from "./interview-ai.service.js";

export const startInterviewSession = async (userId: string) => {
  // 1. Fetch user profile
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("Career profile not found. Please complete onboarding.");
  }

  // 2. Generate questions
  const generatedQuestions = await generateInterviewQuestions({
    targetRole: profile.targetRoleName || profile.targetRole,
    experienceLevel: profile.experienceLevel,
  });

  // 3. Create Session and Questions in a transaction
  const session = await prisma.$transaction(async (tx) => {
    // Optional: mark any existing IN_PROGRESS as ABANDONED (just using COMPLETED vs IN_PROGRESS for now)
    await tx.interviewSession.updateMany({
      where: { userId, status: "IN_PROGRESS" },
      data: { status: "COMPLETED" } // Safely close out old ones without scoring them.
    });

    const newSession = await tx.interviewSession.create({
      data: {
        userId,
        targetRole: profile.targetRoleName || profile.targetRole,
        status: "IN_PROGRESS",
      },
    });

    const questionsData = generatedQuestions.map((q) => ({
      sessionId: newSession.id,
      question: q.question,
      order: q.order,
    }));

    await tx.interviewQuestion.createMany({
      data: questionsData,
    });

    return newSession;
  }, {
    maxWait: 10000,
    timeout: 20000,
  });

  // 4. Return full session with questions
  const fullSession = await prisma.interviewSession.findUnique({
    where: { id: session.id },
    include: {
      questions: { orderBy: { order: "asc" } },
      answers: true,
    },
  });

  return fullSession;
};

export const submitInterviewAnswer = async (
  userId: string,
  questionId: string,
  answerText: string
) => {
  // 1. Verify question and session ownership
  const question = await prisma.interviewQuestion.findUnique({
    where: { id: questionId },
    include: { session: true },
  });

  if (!question || question.session.userId !== userId) {
    throw new Error("Question not found or unauthorized.");
  }

  if (question.session.status !== "IN_PROGRESS") {
    throw new Error("This interview session is no longer active.");
  }

  // 2. Evaluate answer via AI
  const evaluation = await evaluateInterviewAnswer(
    question.question,
    answerText,
    question.session.targetRole || "Unknown Role"
  );

  // 3. Save Answer
  const answer = await prisma.interviewAnswer.upsert({
    where: {
      sessionId_questionId: {
        sessionId: question.sessionId,
        questionId: question.id,
      },
    },
    update: {
      answerText,
      evaluation: evaluation as any,
    },
    create: {
      sessionId: question.sessionId,
      questionId: question.id,
      answerText,
      evaluation: evaluation as any,
    },
  });

  return answer;
};

export const completeInterviewSession = async (userId: string) => {
  // 1. Find active session
  const session = await prisma.interviewSession.findFirst({
    where: { userId, status: "IN_PROGRESS" },
    include: {
      questions: true,
      answers: true,
    },
  });

  if (!session) {
    throw new Error("No active interview session found.");
  }

  // 2. Verify all questions are answered
  if (session.answers.length < session.questions.length) {
    throw new Error("Cannot complete interview. Not all questions have been answered.");
  }

  // 3. Calculate final score
  let totalAnswerScore = 0;
  
  for (const answer of session.answers) {
    const evalData = answer.evaluation as any;
    if (evalData) {
      const { technicalKnowledge, problemSolving, clarity, practicalUnderstanding, communication } = evalData;
      const ansScore = (technicalKnowledge + problemSolving + clarity + practicalUnderstanding + communication) / 5;
      totalAnswerScore += ansScore;
    }
  }

  const finalScore = Math.round(totalAnswerScore / session.answers.length);

  // 4. Complete session and update profile in transaction
  await prisma.$transaction(async (tx) => {
    await tx.interviewSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        score: finalScore,
        completedAt: new Date(),
      },
    });

    await tx.careerProfile.update({
      where: { userId },
      data: {
        interviewScore: finalScore,
      },
    });
  }, {
    maxWait: 10000,
    timeout: 20000,
  });

  return { success: true, finalScore };
};
