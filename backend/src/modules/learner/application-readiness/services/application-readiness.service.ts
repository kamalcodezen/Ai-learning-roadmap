import prisma from "../../../../lib/prisma.js";
import { getCareerReadiness } from "../../readiness/services/readiness.service.js";

const resolveCategoryStatus = (
  score: number | null
): "strong" | "needs_improvement" | "critical" | "missing" => {
  if (score === null || score === undefined) return "missing";
  if (score >= 70) return "strong";
  if (score >= 40) return "needs_improvement";
  return "critical";
};

export const getApplicationReadiness = async (userId: string) => {
  // 1. Fetch canonical career readiness from single source of truth
  const readiness = await getCareerReadiness(userId);

  // 2. Fetch profile & projects for metadata
  const [profile, projects] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.project.findMany({ where: { userId } }),
  ]);

  const knowledge =
    readiness.scores.knowledge !== "NOT_ASSESSED"
      ? Number(readiness.scores.knowledge)
      : null;

  const practical =
    readiness.scores.practical !== "NOT_ASSESSED"
      ? Number(readiness.scores.practical)
      : null;

  const portfolio =
    readiness.scores.projects !== "NOT_ASSESSED"
      ? Number(readiness.scores.projects)
      : null;

  const problemSolving =
    readiness.scores.problemSolving !== "NOT_ASSESSED"
      ? Number(readiness.scores.problemSolving)
      : null;

  const communication =
    readiness.scores.communication !== "NOT_ASSESSED"
      ? Number(readiness.scores.communication)
      : null;

  const interview =
    readiness.scores.interview !== "NOT_ASSESSED"
      ? Number(readiness.scores.interview)
      : typeof profile?.interviewScore === "number" && profile.interviewScore >= 0
        ? Number(profile.interviewScore)
        : null;

  const categories: any[] = [];

  categories.push({
    id: "tech-1",
    name: "Technical Knowledge",
    score: knowledge !== null ? knowledge : 0,
    status: resolveCategoryStatus(knowledge),
    reason:
      knowledge !== null
        ? "Based on diagnostic and practice scores"
        : "Take diagnostic to assess technical skills",
    recommendation: "Keep practicing skills on your roadmap",
  });

  categories.push({
    id: "pract-1",
    name: "Practical Competence",
    score: practical !== null ? practical : 0,
    status: resolveCategoryStatus(practical),
    reason:
      practical !== null
        ? "Based on practical exercise submissions and practice scores"
        : "Complete practical skill exercises to verify hands-on ability",
    recommendation: "Complete more practical skill exercises and build verified projects",
  });

  categories.push({
    id: "port-1",
    name: "Portfolio Strength",
    score: portfolio !== null ? portfolio : 0,
    status: resolveCategoryStatus(portfolio),
    reason:
      projects.length > 0
        ? `You have ${projects.length} project(s) recorded with real evaluation evidence`
        : "No projects added yet",
    recommendation: "Build and add more projects with verified implementation",
  });

  categories.push({
    id: "prob-1",
    name: "Problem Solving",
    score: problemSolving !== null ? problemSolving : 0,
    status: resolveCategoryStatus(problemSolving),
    reason:
      problemSolving !== null
        ? "Based on diagnostic problem-solving performance"
        : "Take diagnostic assessment to evaluate problem-solving ability",
    recommendation: "Practice debugging and algorithmic problem solving",
  });

  categories.push({
    id: "comm-1",
    name: "Communication Skills",
    score: communication !== null ? communication : 0,
    status: resolveCategoryStatus(communication),
    reason:
      communication !== null
        ? "Based on diagnostic technical communication evaluation"
        : "Complete diagnostic communication questions",
    recommendation: "Practice articulating technical concepts clearly",
  });

  categories.push({
    id: "int-1",
    name: "Interview Readiness",
    score: interview !== null ? interview : 0,
    status: resolveCategoryStatus(interview),
    reason:
      interview !== null
        ? "Based on AI mock interview performance"
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
