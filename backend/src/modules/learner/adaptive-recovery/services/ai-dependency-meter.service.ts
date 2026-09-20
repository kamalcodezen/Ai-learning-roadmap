import prisma from "../../../../lib/prisma.js";

export async function calculateAIDependencyMetrics(userId: string) {
  // 1. Pillar 1: Prompt Delegation (35% weight) - from activity logs
  const copilotActivities = await prisma.activityLog.findMany({
    where: {
      userId,
      activityType: { in: ["COPILOT_CHAT", "CHAT_PROMPT", "PROMPT_SUBMISSION"] },
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  let promptScore = 20; // default low delegation (high autonomy)
  if (copilotActivities.length > 0) {
    const fullSolutionRequests = copilotActivities.filter(
      (a) => a.metadata && typeof a.metadata === "object" && (a.metadata as Record<string, unknown>).isFullSolution
    ).length;
    promptScore = Math.min(95, Math.max(10, Math.round((fullSolutionRequests / copilotActivities.length) * 100)));
  }

  // 2. Pillar 2: Code Ownership & Architecture (35% weight) - from Projects
  const userProjects = await prisma.project.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  let ownershipScore = 85;
  if (userProjects.length > 0) {
    const totalScore = userProjects.reduce(
      (sum, p) => sum + (p.architectureScore || p.score || 80),
      0
    );
    ownershipScore = Math.round(totalScore / userProjects.length);
  }

  // 3. Pillar 3: Live Interview Performance (30% weight) - from InterviewSessions
  const userInterviews = await prisma.interviewSession.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  let interviewScore = 80;
  if (userInterviews.length > 0) {
    const totalScore = userInterviews.reduce(
      (sum, i) => sum + (i.overallScore || 75),
      0
    );
    interviewScore = Math.round(totalScore / userInterviews.length);
  }

  // Overall Dependency Calculation
  // High promptScore increases reliance, while high ownership & interview decreases reliance
  const relianceIndex = Math.round(
    promptScore * 0.35 + (100 - ownershipScore) * 0.35 + (100 - interviewScore) * 0.30
  );

  const clampedScore = Math.max(5, Math.min(95, relianceIndex));

  let category = "BALANCED";
  let verdict = "Balanced AI Augmentation! You leverage AI for productivity while retaining architectural grasp.";
  let badge = "🟡 Balanced AI Augmentation (31%–65%)";
  let advice = "Continue practicing whiteboard algorithmic problems without copilot suggestions before implementing.";

  if (clampedScore <= 30) {
    category = "INDEPENDENT";
    verdict = "Outstanding Self-Reliance! You think through logic independently before consulting AI.";
    badge = "🟢 Independent Problem Solver (0%–30%)";
    advice = "Your chance of clearing live whiteboard coding rounds and technical screenings is at the highest percentile.";
  } else if (clampedScore >= 66) {
    category = "HIGH_RELIANCE";
    verdict = "High AI Reliance Alert! Heavy reliance on code copy-pasting detected.";
    badge = "🔴 High AI Reliance Alert (66%–100%)";
    advice = "Warning: Live whiteboard interviews don't allow AI. Action Tip: Solve the next milestone without Copilot prompts to build mental muscle memory.";
  }

  return {
    score: clampedScore,
    category,
    verdict,
    badge,
    advice,
    pillars: {
      promptDelegation: promptScore,
      codeOwnership: ownershipScore,
      liveProblemSolving: interviewScore,
    },
  };
}
