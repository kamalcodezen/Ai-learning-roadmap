import prisma from "../../../lib/prisma.js";

export const getAssessments = async (userId: string) => {
  // 1. Fetch real diagnostic attempts from the database
  const attempts = await prisma.diagnosticAttempt.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
  });

  // 2. Count completed
  const completedCount = attempts.filter((a) => a.status === "COMPLETED").length;

  // 3. Calculate average score
  const completedScores = attempts
    .filter((a) => a.status === "COMPLETED" && a.score !== null)
    .map(a => a.score as number);
    
  const averageScore = completedScores.length > 0 
    ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
    : 0;

  // 4. Map attempts to AssessmentItems
  const assessments = attempts.map(a => ({
    id: a.id,
    title: a.targetRole ? `${a.targetRole} Diagnostic` : "Diagnostic Assessment",
    type: "diagnostic",
    status: a.status === "COMPLETED" ? "completed" : "in_progress",
    score: a.score || undefined,
    description: "Evaluation of your current skills.",
    href: "/diagnostic"
  }));
  
  // 5. Add a placeholder if empty so the UI doesn't look broken
  if (assessments.length === 0) {
    assessments.push({
      id: "placeholder-1",
      title: "Initial Diagnostic Assessment",
      type: "diagnostic",
      status: "not_started",
      score: undefined,
      description: "Baseline evaluation of your current development skills.",
      href: "/diagnostic"
    });
  }

  return {
    completedCount,
    averageScore,
    assessments
  };
};
