import prisma from "../../../../lib/prisma.js";
import { getCareerReadiness } from "../../readiness/services/readiness.service.js";
import { getAdaptiveLearningDecision } from "../../roadmap/services/adaptive-learning.service.js";
import { getOrGenerateLearningPath } from "../../roadmap/services/learning-path.service.js";
import { getSkillEvidenceVerification } from "../../career-intelligence/services/skill-evidence-verifier.service.js";

export const getDashboardOverview = async (userId: string) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // 1. Fetch all dashboard data concurrently (Parallel)
  const [
    profile,
    skillStates,
    projects,
    activityLogs,
    diagnosticResult,
    roadmap,
    evidenceVerification,
  ] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.skillState.findMany({ 
      where: { userId },
      select: { skillName: true, knowledgeScore: true, practiceScore: true, projectScore: true, evidenceScore: true }
    }),
    prisma.project.findMany({ where: { userId }, select: { score: true } }),
    prisma.activityLog.groupBy({
      by: ['type'],
      where: { userId, createdAt: { gte: oneWeekAgo } },
      _count: { _all: true }
    }),
    prisma.diagnosticAttempt.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      select: { 
        score: true,
        targetRole: true,
        answers: {
          where: { question: { order: { in: [4, 6] } } },
          include: { question: true }
        }
      }
    }),
    prisma.roadmap.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { 
        milestones: { orderBy: { order: "asc" }, select: { title: true, description: true, status: true } }
      }
    }),
    getSkillEvidenceVerification(userId).catch(() => ({
      overallSkillScore: 0,
      overallProofScore: 0,
      employerConfidenceSignal: 0,
      employerConfidenceExplanation: "",
      strongEvidenceSkillsCount: 0,
      staleEvidenceSkillsCount: 0,
      skills: [],
    })),
  ]);

  const targetRole = profile?.targetRoleName || profile?.targetRole || "Unknown Role";
  const experienceLevel = profile?.experienceLevel || "BEGINNER";
  
  // Flexible normalized role matcher (handles "fullstack" slug vs "Full Stack Developer" name)
  const roleSlug = (profile?.targetRole || "").toLowerCase().trim();
  const roleName = (profile?.targetRoleName || "").toLowerCase().trim();
  const isRoleMatch = (r?: string | null) => {
    if (!r) return true;
    const norm = r.toLowerCase().trim();
    return (
      norm === roleSlug ||
      norm === roleName ||
      norm.replace(/[\s-_]/g, "") === roleSlug.replace(/[\s-_]/g, "")
    );
  };

  const validDiagnosticResult = isRoleMatch(diagnosticResult?.targetRole) ? diagnosticResult : diagnosticResult;
  const validRoadmap = isRoleMatch(roadmap?.targetRole) ? roadmap : roadmap;

  if (!validRoadmap && profile) {
    // Fire off async canonical roadmap generation without blocking the dashboard load
    getOrGenerateLearningPath(userId).catch(console.error);
  }

  const readinessResult = await getCareerReadiness(userId, {
    profile,
    skillStates,
    projects,
    latestDiagnostic: validDiagnosticResult
  });
  
  const currentMilestone = validRoadmap?.milestones.find((m) => m.status === "CURRENT") || validRoadmap?.milestones[0];

  // Next action logic from Adaptive Learning Engine
  const adaptiveDecision = await getAdaptiveLearningDecision(userId);
  const nextAction = {
    title: adaptiveDecision.title,
    description: adaptiveDecision.recommendation,
    reason: adaptiveDecision.reason,
    actionLabel: adaptiveDecision.actionLabel,
    href: adaptiveDecision.href
  };

  // 1. Career Status
  const careerStatus = skillStates.some((s) => s.knowledgeScore < 40) ? "Needs Attention" : "You're on track";

  // 2. Readiness Calculations
  const readiness = {
    score: readinessResult.score,
    knowledge: readinessResult.scores.knowledge !== "NOT_ASSESSED" ? readinessResult.scores.knowledge : null,
    practical: readinessResult.scores.practical !== "NOT_ASSESSED" ? readinessResult.scores.practical : null,
    projects: readinessResult.scores.projects !== "NOT_ASSESSED" ? readinessResult.scores.projects : null,
    problemSolving: readinessResult.scores.problemSolving !== "NOT_ASSESSED" ? readinessResult.scores.problemSolving : null,
    communication: readinessResult.scores.communication !== "NOT_ASSESSED" ? readinessResult.scores.communication : null,
    interview: readinessResult.scores.interview !== "NOT_ASSESSED" ? readinessResult.scores.interview : null,
    evidence: readinessResult.scores.evidence !== "NOT_ASSESSED" ? readinessResult.scores.evidence : null,
  };

  // 3. Roadmap Details
  let roadmapDetails = null;
  if (validRoadmap) {
    const completedMilestones = validRoadmap.milestones.filter((m) => m.status === "COMPLETED").length;
    const progressPercent = validRoadmap.milestones.length ? Math.round((completedMilestones / validRoadmap.milestones.length) * 100) : 0;
    
    roadmapDetails = {
      currentMilestone: currentMilestone?.title || "Not started",
      progress: progressPercent,
      milestones: validRoadmap.milestones.map((m) => ({
        name: m.title,
        status: m.status === "CURRENT" ? "IN_PROGRESS" : m.status === "UPCOMING" ? "PENDING" : m.status
      })),
    };
  }

  // 4. Learning Debt
  const learningDebt = skillStates.reduce((acc: { skill: string; reason: string; severity: string; source: string }[], s) => {
    if (s.knowledgeScore < 40) {
      acc.push({ skill: s.skillName, reason: "Critical knowledge gap", severity: "HIGH", source: "Diagnostic" });
    } else if (s.practiceScore < 40 && s.knowledgeScore >= 50) {
      acc.push({ skill: s.skillName, reason: "Lacking practical application", severity: "MEDIUM", source: "Practice" });
    } else if (s.evidenceScore < 20 && s.practiceScore >= 50) {
      acc.push({ skill: s.skillName, reason: "Missing project evidence", severity: "LOW", source: "Portfolio" });
    } else if (s.knowledgeScore < 60) {
      acc.push({ skill: s.skillName, reason: "Needs review", severity: "MEDIUM", source: "Diagnostic" });
    }
    return acc;
  }, []).sort((a, b) => (a.severity === "HIGH" ? -1 : b.severity === "HIGH" ? 1 : 0)).slice(0, 3);

  // 5. Trending Skills (Optimized - No history lookup to save heavy query)
  const trendingSkills = [...skillStates].sort((a, b) => b.knowledgeScore - a.knowledgeScore).map((s) => {
    return {
      name: s.skillName,
      score: Math.round(s.knowledgeScore),
      trend: "FLAT" as const
    };
  }).slice(0, 4);

  // 6. Weekly Progress
  const weeklyProgress = {
    learning: activityLogs.find(a => a.type === "LEARNING")?._count._all || null,
    assessments: activityLogs.find(a => a.type === "ASSESSMENT")?._count._all || null,
    projects: activityLogs.find(a => a.type === "PROJECT")?._count._all || null,
    practice: activityLogs.find(a => a.type === "PRACTICE")?._count._all || null,
    careerReadiness: null, // Would need historical overall score comparison
  };

  // 7. Assessments (minimal summary)
  const pendingAssessments = (!validDiagnosticResult ? 1 : 0) + (currentMilestone ? 1 : 0);
  const assessmentsSummary = {
    pendingCount: pendingAssessments,
    completedCount: validDiagnosticResult ? 1 : 0,
  };

  // 8. Proof (summary with verified scores)
  const proofSummary = {
    trackedSkillsCount: skillStates.length,
    overallProofScore: evidenceVerification.overallProofScore,
    overallSkillScore: evidenceVerification.overallSkillScore,
    employerConfidenceSignal: evidenceVerification.employerConfidenceSignal,
  };

  // 9. Four Primary KPIs (Career Readiness, Skill Progress, Learning Progress, Proof Strength)
  const kpis = {
    targetRole,
    careerReadiness: readiness.score,
    skillProgress: evidenceVerification.overallSkillScore,
    learningProgress: roadmapDetails ? roadmapDetails.progress : 0,
    proofStrength: evidenceVerification.overallProofScore,
  };

  // 10. Career Alignment (minimal summary)
  const careerAlignment = {
    target: targetRole,
    isAvailable: skillStates.length > 0,
  };

  // 11. Application Readiness (minimal summary)
  const applicationReadiness = {
    isAvailable: skillStates.length > 0 && projects.length > 0,
  };

  // 12. Portfolio (minimal summary)
  const portfolioStats = {
    projectCount: projects.length,
  };

  // Build the unified DashboardData structure exactly as the frontend expects
  return {
    user: {
      name: "User", // Will be overridden by session in frontend
      image: null,
    },
    career: {
      targetRole,
      experienceLevel,
      status: careerStatus,
    },
    kpis,
    readiness,
    nextAction,
    roadmap: roadmapDetails,
    learningDebt,
    skills: trendingSkills,
    weeklyProgress,
    assessments: assessmentsSummary,
    proof: proofSummary,
    careerAlignment,
    applicationReadiness,
    portfolio: portfolioStats,
  };
};




