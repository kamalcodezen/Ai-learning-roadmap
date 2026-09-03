import prisma from "../../../../lib/prisma.js";

export type ReadinessResult = {
  score: number;
  scores: {
    knowledge: number | "NOT_ASSESSED";
    practical: number | "NOT_ASSESSED";
    projects: number | "NOT_ASSESSED";
    problemSolving: number | "NOT_ASSESSED";
    communication: number | "NOT_ASSESSED";
    interview: number | "NOT_ASSESSED";
    evidence: number | "NOT_ASSESSED";
  };
  communicationEvaluation: any | null;
  strongSkills: string[];
  weakSkills: string[];
};

export const getCareerReadiness = async (
  userId: string,
  prefetchedData?: {
    profile: any;
    skillStates: any[];
    projects: any[];
    latestDiagnostic: any;
  }
): Promise<ReadinessResult> => {
  // Use prefetched data if provided, otherwise fetch it
  let profile, skillStates, projects, latestDiagnostic;

  if (prefetchedData) {
    profile = prefetchedData.profile;
    skillStates = prefetchedData.skillStates;
    projects = prefetchedData.projects;
    latestDiagnostic = prefetchedData.latestDiagnostic;
  } else {
    // Fetch required data in parallel
    [profile, skillStates, projects, latestDiagnostic] = await Promise.all([
      prisma.careerProfile.findUnique({ where: { userId } }),
      prisma.skillState.findMany({ 
        where: { userId },
        select: { skillName: true, knowledgeScore: true, practiceScore: true, evidenceScore: true }
      }),
      prisma.project.findMany({ where: { userId }, select: { score: true } }),
      prisma.diagnosticAttempt.findFirst({
        where: { userId, status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        include: {
          answers: {
            where: { question: { order: { in: [4, 6] } } },
            include: { question: true }
          },
        },
      }),
    ]);
  }

  // 1. Knowledge & Practical & Evidence (from SkillState)
  let knowledge: number | "NOT_ASSESSED" = "NOT_ASSESSED";
  let practical: number | "NOT_ASSESSED" = "NOT_ASSESSED";
  let evidence: number | "NOT_ASSESSED" = "NOT_ASSESSED";

  if (skillStates.length > 0) {
    knowledge = Math.round(skillStates.reduce((a: number, s: any) => a + s.knowledgeScore, 0) / skillStates.length);
    practical = Math.round(skillStates.reduce((a: number, s: any) => a + s.practiceScore, 0) / skillStates.length);
    evidence = Math.round(skillStates.reduce((a: number, s: any) => a + s.evidenceScore, 0) / skillStates.length);
  }

  // 2. Projects (from Project records)
  let projectScore: number | "NOT_ASSESSED" = "NOT_ASSESSED";
  if (projects.length > 0) {
    projectScore = Math.round(projects.reduce((a: number, p: any) => a + p.score, 0) / projects.length);
  }

  // 3. Problem Solving & 4. Communication (from Diagnostic Answer)
  let problemSolving: number | "NOT_ASSESSED" = "NOT_ASSESSED";
  let communication: number | "NOT_ASSESSED" = "NOT_ASSESSED";
  let communicationEvaluation: any = null;

  if (latestDiagnostic && latestDiagnostic.answers && latestDiagnostic.answers.length > 0) {
    // Process Problem Solving (Q4)
    const psAnswer = latestDiagnostic.answers.find((a: any) => a.question.order === 4);
    if (psAnswer) {
      problemSolving = psAnswer.isCorrect ? 100 : 0;
    }

    // Process Communication (Q6)
    const commAnswer = latestDiagnostic.answers.find((a: any) => a.question.order === 6);
    if (commAnswer && commAnswer.evaluation) {
      communicationEvaluation = commAnswer.evaluation;
      communication = typeof communicationEvaluation.score === 'number' ? communicationEvaluation.score : "NOT_ASSESSED";
    }
  }

  // 5. Interview (from CareerProfile)
  let interview: number | "NOT_ASSESSED" = "NOT_ASSESSED";
  if (profile && typeof profile.interviewScore === 'number' && profile.interviewScore > 0) {
    interview = Math.round(profile.interviewScore);
  }

  // Calculate Overall Readiness dynamically
  let totalScore = 0;
  let dimensionsCount = 0;
  let totalSum = 0;

  const activeDimensions = [knowledge, practical, projectScore, problemSolving, communication, interview, evidence];
  
  for (const dim of activeDimensions) {
    if (dim !== "NOT_ASSESSED") {
      totalSum += dim as number;
      dimensionsCount++;
    }
  }

  if (dimensionsCount > 0) {
    totalScore = Math.round(totalSum / dimensionsCount);
  } else if (latestDiagnostic && typeof latestDiagnostic.score === 'number') {
    // Fallback to purely diagnostic score if no active dimensions are populated (e.g. brand new user)
    totalScore = latestDiagnostic.score;
  }

  // Determine strong and weak skills based on knowledgeScore
  const strongSkills = skillStates.filter((s: any) => s.knowledgeScore > 70).map((s: any) => s.skillName).slice(0, 5);
  const weakSkills = skillStates.filter((s: any) => s.knowledgeScore < 40).map((s: any) => s.skillName).slice(0, 5);

  return {
    score: totalScore,
    scores: {
      knowledge,
      practical,
      projects: projectScore,
      problemSolving,
      communication,
      interview,
      evidence,
    },
    communicationEvaluation,
    strongSkills,
    weakSkills,
  };
};
