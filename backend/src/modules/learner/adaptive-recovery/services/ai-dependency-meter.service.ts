import prisma from "../../../../lib/prisma.js";

export type DependencyCategory = "INDEPENDENT" | "BALANCED" | "HIGH_RELIANCE";

export interface DependencyPillar {
  name: string;
  score: number; // 0-100 autonomy score (higher = more independent)
  dependencyScore: number; // 0-100 dependency score (higher = more reliant)
  weight: number;
  status: "OPTIMAL" | "HEALTHY" | "NEEDS_ATTENTION";
  explanation: string;
  metricData: string;
}

export interface AiDependencyOutput {
  overallDependencyScore: number; // 0 to 100% (0 = pure independent, 100 = purely copy-pasting)
  autonomyScore: number; // 100 - dependencyScore
  category: DependencyCategory;
  categoryTitle: string;
  categoryBadge: string;
  categoryDescription: string;
  interviewSuccessProbability: number; // percentage
  employerSignalRating: "STRONG_BUY" | "SOLID_CONTRIBUTOR" | "SCREENING_RISK";
  employerPerceptionSummary: string;
  pillars: {
    promptAutonomy: DependencyPillar;
    projectExplanation: DependencyPillar;
    interviewArticulation: DependencyPillar;
  };
  actionableRemedies: {
    title: string;
    description: string;
    impact: "HIGH" | "MEDIUM";
  }[];
  dataSignalsSummary: {
    projectsAnalyzedCount: number;
    chatInteractionsCount: number;
    interviewSessionsCount: number;
    assessmentsEvaluatedCount: number;
    hasCalibrationData: boolean;
  };
}

/**
 * Computes the multi-factor AI Dependency Index from real user activity, projects,
 * copilot prompts, and live interview responses.
 */
export async function getAiDependencyAnalysis(userId: string): Promise<AiDependencyOutput> {
  const [projects, chatLogs, interviewSessions, diagnosticAttempts, profile] =
    await Promise.all([
      prisma.project.findMany({
        where: { userId },
        select: {
          id: true,
          score: true,
          explanationQuality: true,
          projectType: true,
          isVerified: true,
          createdAt: true,
        },
      }),
      prisma.activityLog.findMany({
        where: {
          userId,
          type: { in: ["CHAT_MESSAGE", "COPILOT_INTERACTION", "COPILOT_PROMPT"] },
        },
        take: 50,
        orderBy: { createdAt: "desc" },
        select: { description: true, metadata: true },
      }),
      prisma.interviewSession.findMany({
        where: { userId, status: "COMPLETED" },
        include: {
          answers: { select: { evaluation: true } },
        },
      }),
      prisma.diagnosticAttempt.findMany({
        where: { userId, status: "COMPLETED" },
        select: { score: true },
      }),
      prisma.careerProfile.findUnique({
      where: { userId },
      select: { targetRole: true, targetRoleName: true, experienceLevel: true },
    }),
  ]);

  const targetRole = profile?.targetRoleName || profile?.targetRole || "Software Engineering";

  // 1. Pillar A: Prompt Autonomy Analysis
  // Analyzes chat interactions to determine if learner asks for architecture/hints or raw code
  let rawCodeRequests = 0;
  let socraticHintRequests = 0;

  chatLogs.forEach((log) => {
    const text = (log.description || "").toLowerCase();
    const meta = log.metadata as any;
    const promptText = (meta?.prompt || meta?.message || text).toLowerCase();

    const isDirectCodeRequest =
      promptText.includes("give me the code") ||
      promptText.includes("write full code") ||
      promptText.includes("complete this code") ||
      promptText.includes("fix my code") ||
      promptText.includes("copy paste") ||
      promptText.includes("generate code");

    if (isDirectCodeRequest) {
      rawCodeRequests++;
    } else {
      socraticHintRequests++;
    }
  });

  const totalChatInteractions = chatLogs.length;
  let promptAutonomyScore = 80; // default healthy baseline for newer learners

  if (totalChatInteractions > 0) {
    const codeDumpRatio = rawCodeRequests / totalChatInteractions;
    promptAutonomyScore = Math.max(10, Math.min(95, Math.round((1 - codeDumpRatio) * 100)));
  } else {
    // If learner hasn't needed to prompt copilot repeatedly, autonomy is high
    promptAutonomyScore = 85;
  }

  // 2. Pillar B: Project Code Explanation & Authoring Autonomy
  // Evaluates explanation quality score, imported manual repos, and verified evidence
  let projectExplanationScore = 75; // baseline

  if (projects.length > 0) {
    const validQualityScores = projects
      .map((p) => p.explanationQuality)
      .filter((q): q is number => typeof q === "number" && q > 0);

    const avgExplanation = validQualityScores.length
      ? validQualityScores.reduce((a, b) => a + b, 0) / validQualityScores.length
      : 70;

    // Bonus for manual imported projects and verified evidence
    const importedCount = projects.filter((p) => p.projectType === "IMPORTED").length;
    const verifiedCount = projects.filter((p) => p.isVerified).length;
    const manualBonus = Math.min(20, importedCount * 10 + verifiedCount * 5);

    projectExplanationScore = Math.min(98, Math.max(20, Math.round(avgExplanation + manualBonus)));
  }

  // 3. Pillar C: Live Technical Interview Articulation
  // In live verbal mock interviews, AI cannot answer for you. High score = high cognitive independence
  let interviewArticulationScore = 70; // default baseline

  if (interviewSessions.length > 0) {
    const scores = interviewSessions
      .map((s) => s.score)
      .filter((sc): sc is number => typeof sc === "number" && !isNaN(sc));

    if (scores.length > 0) {
      const avgInterview = scores.reduce((a, b) => a + b, 0) / scores.length;
      interviewArticulationScore = Math.max(15, Math.min(98, Math.round(avgInterview)));
    }
  } else if (diagnosticAttempts.length > 0) {
    // Fall back to diagnostic baseline if no interview yet
    const avgDiag =
      diagnosticAttempts.reduce((a, b) => a + (b.score || 0), 0) / diagnosticAttempts.length;
    interviewArticulationScore = Math.max(40, Math.min(85, Math.round(avgDiag)));
  }

  // 4. Weighted Composite Autonomy & Dependency Calculation
  // Weights: 35% Project Explanation, 40% Interview Articulation, 25% Prompt Autonomy
  const weightedAutonomy = Math.round(
    projectExplanationScore * 0.35 +
    interviewArticulationScore * 0.40 +
    promptAutonomyScore * 0.25
  );

  const overallDependencyScore = Math.max(5, Math.min(95, 100 - weightedAutonomy));
  const autonomyScore = 100 - overallDependencyScore;

  // 5. Classification & Categorization
  let category: DependencyCategory = "BALANCED";
  let categoryTitle = "Balanced AI Augmentation";
  let categoryBadge = "Healthy AI Adoption ⚖️";
  let categoryDescription =
    "Optimal tool usage. You leverage AI assistants for speed and boilerplate elimination while demonstrating firm command of core algorithms and architectural fundamentals.";
  let interviewSuccessProbability = 78;
  let employerSignalRating: "STRONG_BUY" | "SOLID_CONTRIBUTOR" | "SCREENING_RISK" = "SOLID_CONTRIBUTOR";
  let employerPerceptionSummary =
    "Hiring managers value engineers who use AI to boost productivity without losing deep debugging ability.";

  if (overallDependencyScore <= 30) {
    category = "INDEPENDENT";
    categoryTitle = "Independent Problem Solver";
    categoryBadge = "Interview Ready 🟢";
    categoryDescription =
      "Exceptional self-reliance. Your codebase explanations and live interview articulations prove you understand system architecture deeply from first principles.";
    interviewSuccessProbability = 94;
    employerSignalRating = "STRONG_BUY";
    employerPerceptionSummary =
      "Top percentile candidate for live whiteboard and architectural technical screenings. Low risk of interview failure.";
  } else if (overallDependencyScore >= 66) {
    category = "HIGH_RELIANCE";
    categoryTitle = "High AI Reliance Alert";
    categoryBadge = "Screening Vulnerability 🔴";
    categoryDescription =
      "Caution: Signals suggest heavy reliance on AI-generated solutions with limited conceptual articulation. You risk stumbling during live, non-assisted technical screening rounds.";
    interviewSuccessProbability = 42;
    employerSignalRating = "SCREENING_RISK";
    employerPerceptionSummary =
      "Candidate may excel at rapid prototyping with AI prompts, but might struggle under closed-book live whiteboard questions.";
  }

  // 6. Actionable Remedies
  const actionableRemedies = [
    {
      title: "Switch Copilot to 'Socratic / Hint-Only' Mode",
      description: "When stuck, ask Copilot for the algorithmic concept or edge case, rather than asking for the full code solution.",
      impact: "HIGH" as const,
    },
    {
      title: `Verbalize ${targetRole} Architecture in AI Mock Interviews`,
      description: "Complete at least one technical mock interview round per milestone to build spontaneous verbal recall.",
      impact: "HIGH" as const,
    },
    {
      title: "Conduct Code Self-Reviews on Pull Requests",
      description: "Before submitting projects, write detailed PR descriptions explaining time complexity (Big-O) and architectural tradeoffs.",
      impact: "MEDIUM" as const,
    },
  ];

  const hasCalibrationData = Boolean(
    projects.length > 0 || totalChatInteractions > 0 || interviewSessions.length > 0
  );

  return {
    overallDependencyScore,
    autonomyScore,
    category,
    categoryTitle,
    categoryBadge,
    categoryDescription,
    interviewSuccessProbability,
    employerSignalRating,
    employerPerceptionSummary,
    pillars: {
      promptAutonomy: {
        name: "Prompting Autonomy",
        score: promptAutonomyScore,
        dependencyScore: 100 - promptAutonomyScore,
        weight: 25,
        status: promptAutonomyScore >= 70 ? "OPTIMAL" : promptAutonomyScore >= 45 ? "HEALTHY" : "NEEDS_ATTENTION",
        explanation: "Measures whether you seek conceptual guidance vs asking the model to write code for you.",
        metricData: totalChatInteractions
          ? `${totalChatInteractions} interactions tracked (${Math.round((promptAutonomyScore / 100) * totalChatInteractions)} socratic hints)`
          : "Calibrated baseline for new learner",
      },
      projectExplanation: {
        name: "Project Code Articulation",
        score: projectExplanationScore,
        dependencyScore: 100 - projectExplanationScore,
        weight: 35,
        status: projectExplanationScore >= 70 ? "OPTIMAL" : projectExplanationScore >= 45 ? "HEALTHY" : "NEEDS_ATTENTION",
        explanation: "Evaluates your ability to independently explain project architecture and tradeoffs.",
        metricData: projects.length
          ? `${projects.length} project(s) analyzed (${projects.filter((p) => p.isVerified).length} verified)`
          : "Initial curriculum baseline",
      },
      interviewArticulation: {
        name: "Live Screening Recall",
        score: interviewArticulationScore,
        dependencyScore: 100 - interviewArticulationScore,
        weight: 40,
        status: interviewArticulationScore >= 70 ? "OPTIMAL" : interviewArticulationScore >= 45 ? "HEALTHY" : "NEEDS_ATTENTION",
        explanation: "Validates spontaneous reasoning without access to LLM auto-complete or web search.",
        metricData: interviewSessions.length
          ? `${interviewSessions.length} completed mock interview(s)`
          : "Baseline from diagnostic assessments",
      },
    },
    actionableRemedies,
    dataSignalsSummary: {
      projectsAnalyzedCount: projects.length,
      chatInteractionsCount: totalChatInteractions,
      interviewSessionsCount: interviewSessions.length,
      assessmentsEvaluatedCount: diagnosticAttempts.length,
      hasCalibrationData,
    },
  };
}
