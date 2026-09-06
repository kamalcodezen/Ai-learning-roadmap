import prisma from "../../../../lib/prisma.js";
import { getCareerReadiness } from "../../readiness/services/readiness.service.js";

export const getApplicationReadiness = async (userId: string) => {
  // 1. Fetch canonical career readiness from single source of truth
  const readiness = await getCareerReadiness(userId);

  // 2. Fetch profile & projects for metadata
  const [profile, projects] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.project.findMany({ where: { userId } }),
  ]);

  const technical =
    readiness.scores.knowledge !== "NOT_ASSESSED"
      ? Number(readiness.scores.knowledge)
      : null;

  const portfolio =
    readiness.scores.projects !== "NOT_ASSESSED"
      ? Number(readiness.scores.projects)
      : null;

  const interview =
    readiness.scores.interview !== "NOT_ASSESSED"
      ? Number(readiness.scores.interview)
      : profile?.interviewScore || null;

  const categories: any[] = [];

  categories.push({
    id: "tech-1",
    name: "Technical Knowledge",
    score: technical || 0,
    status:
      technical && technical > 70
        ? "strong"
        : technical && technical > 40
          ? "needs_improvement"
          : "missing",
    reason: technical
      ? "Based on diagnostic and practice scores"
      : "Take diagnostic to assess technical skills",
    recommendation: "Keep practicing skills on your roadmap",
  });

  categories.push({
    id: "port-1",
    name: "Portfolio Strength",
    score: portfolio || 0,
    status:
      portfolio && portfolio > 70
        ? "strong"
        : portfolio && portfolio > 40
          ? "needs_improvement"
          : "missing",
    reason:
      projects.length > 0
        ? `You have ${projects.length} project(s) recorded`
        : "No projects added yet",
    recommendation: "Build and add more projects",
  });

  categories.push({
    id: "int-1",
    name: "Interview Readiness",
    score: interview || 0,
    status:
      interview && interview > 70
        ? "strong"
        : interview && interview > 40
          ? "needs_improvement"
          : "missing",
    reason: interview
      ? "Based on mock interview performance"
      : "No mock interviews completed",
    recommendation: "Schedule a mock interview",
  });

  return {
    overallScore: readiness.score,
    isReady: readiness.score >= 70,
    dimensions: {
      overallReadiness: readiness.score,
      knowledgeProficiency: readiness.scores.knowledge,
      practicalCompetence: readiness.scores.practical,
      projectExecution: readiness.scores.projects,
      problemSolving: readiness.scores.problemSolving,
      communication: readiness.scores.communication,
      interviewPreparedness: readiness.scores.interview,
    },
    categories,
  };
};

