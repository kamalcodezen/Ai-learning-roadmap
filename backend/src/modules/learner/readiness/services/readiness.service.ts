import prisma from "../../../../lib/prisma.js";
import { getRequiredSkillsForRole } from "../../career-alignment/services/career-skills.map.js";
import { isMatchingSkill } from "../../assessments/services/skill-simulation.service.js";

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
  },
  targetRoleOverride?: string,
): Promise<ReadinessResult> => {
  // Use prefetched data if provided, otherwise fetch it
  let profile, skillStates, projects, latestDiagnostic, allDiagnosticAttempts, activityLogs;

  if (prefetchedData) {
    profile = prefetchedData.profile;
    skillStates = prefetchedData.skillStates;
    projects = prefetchedData.projects;
    latestDiagnostic = prefetchedData.latestDiagnostic;
    [allDiagnosticAttempts, activityLogs] = await Promise.all([
      prisma.diagnosticAttempt.findMany({
        where: { userId, status: "COMPLETED" },
        include: { answers: { include: { question: true } } },
      }),
      prisma.activityLog.findMany({
        where: { userId, type: "ASSESSMENT" },
      }),
    ]);
  } else {
    // Fetch required data in parallel
    [profile, skillStates, projects, latestDiagnostic, allDiagnosticAttempts, activityLogs] = await Promise.all([
      prisma.careerProfile.findUnique({ where: { userId } }),
      prisma.skillState.findMany({ 
        where: { userId },
        select: { skillName: true, knowledgeScore: true, practiceScore: true, evidenceScore: true }
      }),
      prisma.project.findMany({ where: { userId }, select: { score: true, isVerified: true } }),
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
      prisma.diagnosticAttempt.findMany({
        where: { userId, status: "COMPLETED" },
        include: { answers: { include: { question: true } } },
      }),
      prisma.activityLog.findMany({
        where: { userId, type: "ASSESSMENT" },
      }),
    ]);
  }

  const effectiveRole = targetRoleOverride || profile?.targetRoleName || profile?.targetRole || "Full Stack Developer";
  const requiredSkills = getRequiredSkillsForRole(effectiveRole);

  // 1. Knowledge & Practical (from SkillState)
  let knowledge: number | "NOT_ASSESSED" = "NOT_ASSESSED";
  let practical: number | "NOT_ASSESSED" = "NOT_ASSESSED";

  if (skillStates.length > 0) {
    knowledge = Math.round(skillStates.reduce((a: number, s: any) => a + (s.knowledgeScore || 0), 0) / skillStates.length);
    practical = Math.round(skillStates.reduce((a: number, s: any) => a + (s.practiceScore || 0), 0) / skillStates.length);
  }

  // 2. Evidence Score (multidimensional verified telemetry)
  let evidence: number | "NOT_ASSESSED" = "NOT_ASSESSED";
  const verifiedProjects = (projects || []).filter((p: any) => (p.score && p.score > 0) || p.isVerified);
  const correctDiagAnswers = (allDiagnosticAttempts || []).flatMap((d: any) => (d.answers || []).filter((a: any) => a.isCorrect));
  const simCount = (activityLogs || []).length;

  if (skillStates.length > 0 || (projects && projects.length > 0) || correctDiagAnswers.length > 0 || simCount > 0) {
    let evScore = 0;
    if (verifiedProjects.length > 0) evScore += Math.min(40, verifiedProjects.length * 20);
    if (correctDiagAnswers.length > 0) evScore += Math.min(35, correctDiagAnswers.length * 7);
    if (simCount > 0) evScore += Math.min(25, simCount * 15);

    const avgSkillEvidence = skillStates.length > 0
      ? Math.round(skillStates.reduce((a: number, s: any) => a + (s.evidenceScore || 0), 0) / skillStates.length)
      : 0;

    evidence = Math.min(100, Math.max(evScore, avgSkillEvidence));
  }

  // 3. Projects (from Project records)
  let projectScore: number | "NOT_ASSESSED" = "NOT_ASSESSED";
  if (projects && projects.length > 0) {
    projectScore = Math.round(projects.reduce((a: number, p: any) => a + (p.score || 0), 0) / projects.length);
  }

  // 4. Problem Solving & 5. Communication (from Diagnostic Answer)
  let problemSolving: number | "NOT_ASSESSED" = "NOT_ASSESSED";
  let communication: number | "NOT_ASSESSED" = "NOT_ASSESSED";
  let communicationEvaluation: any = null;

  if (latestDiagnostic && latestDiagnostic.answers && latestDiagnostic.answers.length > 0) {
    // Process Problem Solving (Q4)
    const psAnswer = latestDiagnostic.answers.find((a: any) => a.question?.order === 4);
    if (psAnswer) {
      problemSolving = psAnswer.isCorrect ? 100 : 0;
    }

    // Process Communication (Q6)
    const commAnswer = latestDiagnostic.answers.find((a: any) => a.question?.order === 6);
    if (commAnswer && commAnswer.evaluation) {
      communicationEvaluation = commAnswer.evaluation;
      communication = typeof communicationEvaluation.score === 'number' ? communicationEvaluation.score : "NOT_ASSESSED";
    }
  }

  // 6. Interview (from CareerProfile)
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
    totalScore = latestDiagnostic.score;
  }

  // Determine Strong Skills (High knowledge and/or practice)
  const strongSkills = skillStates
    .filter((s: any) => (s.knowledgeScore || 0) >= 70 || (s.practiceScore || 0) >= 60)
    .sort((a: any, b: any) => ((b.knowledgeScore || 0) + (b.practiceScore || 0)) - ((a.knowledgeScore || 0) + (a.practiceScore || 0)))
    .map((s: any) => s.skillName)
    .slice(0, 5);

  // Determine Weak Skills / Needs Work relative to the Target Role
  const missingReqSkills = requiredSkills
    .filter((r) => !skillStates.some((s: any) => isMatchingSkill(s.skillName, r.skill)))
    .map((r) => r.skill);

  const lowPracticeSkills = skillStates
    .filter((s: any) => (s.knowledgeScore || 0) > 0 && (s.practiceScore || 0) < 40)
    .map((s: any) => `${s.skillName} (Needs Practice)`);

  const lowKnowledgeSkills = skillStates
    .filter((s: any) => (s.knowledgeScore || 0) < 60)
    .map((s: any) => s.skillName);

  const weakSkills = [
    ...missingReqSkills,
    ...lowPracticeSkills,
    ...lowKnowledgeSkills,
  ]
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 5);

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
