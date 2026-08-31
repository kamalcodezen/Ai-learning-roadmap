import prisma from "../../../../lib/prisma.js";

export const getApplicationReadiness = async (userId: string) => {
  // 1. Fetch real career profile for interview/resume scores
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  // 2. Fetch real skill states for technical readiness
  const skillStates = await prisma.skillState.findMany({
    where: { userId },
  });

  // 3. Fetch real projects for portfolio readiness
  const projects = await prisma.project.findMany({
    where: { userId },
  });

  // 4. Calculate individual metrics deterministically
  let technical = null;
  if (skillStates.length > 0) {
    const totalTechnical = skillStates.reduce((acc, s) => acc + (s.knowledgeScore + s.practiceScore) / 2, 0);
    technical = Math.round(totalTechnical / skillStates.length);
  }

  let portfolio = null;
  if (projects.length > 0) {
    portfolio = Math.min(100, projects.length * 20); // Basic deterministic metric: 5 projects = 100%
  }

  // Use real database scores, or null if they haven't been assessed yet
  const interview = profile?.interviewScore || null;
  const resume = profile?.resumeScore || null;

  // 5. Calculate overall readiness ONLY if we have enough trustworthy data.
  // We need at least 2 valid metrics to give a meaningful overall score, avoiding fake/misleading percentages.
  let overallScore = null;

  const availableMetrics = [];
  if (technical !== null) availableMetrics.push(technical);
  if (portfolio !== null) availableMetrics.push(portfolio);
  if (interview !== null) availableMetrics.push(interview);
  if (resume !== null) availableMetrics.push(resume);

  // If we have at least 2 metrics, we provide an overall average
  if (availableMetrics.length >= 2) {
    const sum = availableMetrics.reduce((acc, val) => acc + val, 0);
    overallScore = Math.round(sum / availableMetrics.length);
  }

  const categories: any[] = [];
  
  categories.push({
    id: "tech-1",
    name: "Technical Knowledge",
    score: technical || 0,
    status: technical && technical > 70 ? "strong" : technical && technical > 40 ? "needs_improvement" : "missing",
    reason: technical ? "Based on diagnostic and practice scores" : "Take diagnostic to assess technical skills",
    recommendation: "Keep practicing skills on your roadmap"
  });

  categories.push({
    id: "port-1",
    name: "Portfolio Strength",
    score: portfolio || 0,
    status: portfolio && portfolio > 70 ? "strong" : portfolio && portfolio > 40 ? "needs_improvement" : "missing",
    reason: portfolio ? `You have ${projects.length} verified projects` : "No projects added yet",
    recommendation: "Build and add more projects"
  });

  categories.push({
    id: "int-1",
    name: "Interview Readiness",
    score: interview || 0,
    status: interview && interview > 70 ? "strong" : interview && interview > 40 ? "needs_improvement" : "missing",
    reason: interview ? "Based on mock interview performance" : "No mock interviews completed",
    recommendation: "Schedule a mock interview"
  });

  return {
    overallScore: overallScore || 0,
    isReady: overallScore ? overallScore >= 80 : false,
    categories
  };
};
