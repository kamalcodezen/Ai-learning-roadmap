import prisma from "../../../../lib/prisma.js";
import { getCareerReadiness } from "../../readiness/services/readiness.service.js";
import { getAdaptiveLearningDecision } from "../../roadmap/services/adaptive-learning.service.js";
import { getOrGenerateLearningPath } from "../../roadmap/services/learning-path.service.js";
import { getSkillEvidenceVerification } from "../../career-intelligence/services/skill-evidence-verifier.service.js";
import { isMatchingSkill } from "../../assessments/services/skill-simulation.service.js";

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
    interviewSessions,
    historyStates,
    evidenceVerification,
  ] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.skillState.findMany({ 
      where: { userId },
      select: { skillName: true, knowledgeScore: true, practiceScore: true, projectScore: true, evidenceScore: true, lastReviewed: true }
    }),
    prisma.project.findMany({ 
      where: { userId }, 
      select: { id: true, score: true, isVerified: true, techStack: true, createdAt: true } 
    }),
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
        completedAt: true,
        answers: {
          where: { question: { order: { in: [4, 6] } } },
          include: { question: true }
        }
      }
    }),
    prisma.roadmap.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { 
        milestones: { orderBy: { order: "asc" }, select: { id: true, title: true, description: true, status: true, unlocks: true } }
      }
    }),
    prisma.interviewSession.findMany({
      where: { userId },
      select: { status: true }
    }),
    prisma.skillStateHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
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

  const validDiagnosticResult = isRoleMatch(diagnosticResult?.targetRole) ? diagnosticResult : null;
  const validRoadmap = isRoleMatch(roadmap?.targetRole) ? roadmap : null;

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

  // Next action logic from Adaptive Learning Engine — reusing prefetched data
  const adaptiveDecision = await getAdaptiveLearningDecision(userId, {
    profile,
    skillStates,
    roadmap: validRoadmap,
    latestAttempt: validDiagnosticResult,
    projects,
    interviewSessions,
  });

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
    
    const blockingPrerequisite = adaptiveDecision.type === "REMEDIATE_GAP" && adaptiveDecision.targetSkill
      ? adaptiveDecision.targetSkill
      : null;

    roadmapDetails = {
      currentMilestone: currentMilestone?.title || "Not started",
      blockingPrerequisite,
      progress: progressPercent,
      milestones: validRoadmap.milestones.map((m) => ({
        name: m.title,
        status: m.status === "CURRENT" ? "IN_PROGRESS" : m.status === "UPCOMING" ? "PENDING" : m.status
      })),
    };
  }

  // Canonical resolution of SkillStates:
  // If multiple records represent the same conceptual skill (e.g. "Node.js / Architecture" vs "Architecture"),
  // sort by most recent lastReviewed and use the authoritative latest evaluation as canonical state.
  const reconciledSkillStates = (() => {
    const map = new Map<string, typeof skillStates[0]>();
    const sorted = [...skillStates].sort((a, b) => {
      const timeA = a.lastReviewed ? new Date(a.lastReviewed).getTime() : 0;
      const timeB = b.lastReviewed ? new Date(b.lastReviewed).getTime() : 0;
      return timeB - timeA;
    });

    for (const state of sorted) {
      const existingKey = Array.from(map.keys()).find(k => isMatchingSkill(k, state.skillName));
      if (!existingKey) {
        map.set(state.skillName, state);
      }
    }
    return Array.from(map.values());
  })();

  // 4. Learning Debt (Dynamically derived from canonical SkillState gaps without arbitrary slice)
  const targetPrereqSkill = adaptiveDecision.type === "REMEDIATE_GAP" ? adaptiveDecision.targetSkill?.toLowerCase() : null;

  const learningDebt = reconciledSkillStates.reduce((acc: { skill: string; reason: string; severity: "HIGH" | "MEDIUM" | "LOW"; source: string; score: number }[], s) => {
    if (s.knowledgeScore < 40) {
      acc.push({ skill: s.skillName, reason: "Critical knowledge gap", severity: "HIGH", source: "Diagnostic", score: s.knowledgeScore });
    } else if (s.knowledgeScore < 60) {
      acc.push({ skill: s.skillName, reason: "Needs review", severity: "MEDIUM", source: "Diagnostic", score: s.knowledgeScore });
    } else if (s.practiceScore > 0 && s.practiceScore < 40 && s.knowledgeScore >= 60) {
      acc.push({ skill: s.skillName, reason: "Lacking practical application", severity: "MEDIUM", source: "Practice", score: s.knowledgeScore });
    } else if (s.evidenceScore > 0 && s.evidenceScore < 20 && s.practiceScore >= 50) {
      acc.push({ skill: s.skillName, reason: "Missing project evidence", severity: "LOW", source: "Portfolio", score: s.knowledgeScore });
    }
    return acc;
  }, []).sort((a, b) => {
    // If one is the blocking prerequisite from Next Best Action, prioritize it at the top
    const aIsPrereq = targetPrereqSkill && isMatchingSkill(a.skill, targetPrereqSkill);
    const bIsPrereq = targetPrereqSkill && isMatchingSkill(b.skill, targetPrereqSkill);
    if (aIsPrereq && !bIsPrereq) return -1;
    if (bIsPrereq && !aIsPrereq) return 1;

    // Severity order: HIGH first, then MEDIUM, then LOW
    const severityWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const sevDiff = (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
    if (sevDiff !== 0) return sevDiff;

    // Lowest score first
    return a.score - b.score;
  }).map(({ score: _score, ...rest }) => rest);

  // 5. Trending Skills (Computed from reconciled SkillState & actual SkillStateHistory)
  const trendingSkills = [...reconciledSkillStates]
    .sort((a, b) => b.knowledgeScore - a.knowledgeScore)
    .map((s) => {
      const records = historyStates.filter(
        (h) => isMatchingSkill(h.skillName, s.skillName)
      );
      // Prefer record from >= 7 days ago if available, otherwise previous record
      const pastRecord =
        records.find((h) => h.createdAt <= oneWeekAgo) ||
        (records.length > 1 ? records[1] : null);

      let trend: "UP" | "DOWN" | "FLAT" | "NEW" = "NEW";
      if (pastRecord) {
        const diff = Math.round(s.knowledgeScore - pastRecord.knowledgeScore);
        if (diff > 2) trend = "UP";
        else if (diff < -2) trend = "DOWN";
        else trend = "FLAT";
      } else if (records.length === 1) {
        trend = "FLAT";
      }

      return {
        name: s.skillName,
        score: Math.round(s.knowledgeScore),
        trend,
      };
    })
    .slice(0, 4);

  // 6. Career Readiness Delta (Computed using canonical getCareerReadiness with historical data)
  let careerReadinessDelta: number | null = null;
  if (historyStates.length > 0) {
    const pastSkillMap = new Map<string, { skillName: string; knowledgeScore: number; practiceScore: number; evidenceScore: number }>();
    for (const h of historyStates) {
      if (h.createdAt <= oneWeekAgo && !pastSkillMap.has(h.skillName)) {
        pastSkillMap.set(h.skillName, {
          skillName: h.skillName,
          knowledgeScore: h.knowledgeScore,
          practiceScore: h.practiceScore,
          evidenceScore: h.evidenceScore,
        });
      }
    }

    // Fallback: If no records are older than 7 days, check if user has multiple historical snapshots
    if (pastSkillMap.size === 0 && historyStates.length > skillStates.length) {
      const seenFirst = new Set<string>();
      for (const h of historyStates) {
        if (!seenFirst.has(h.skillName)) {
          seenFirst.add(h.skillName);
        } else if (!pastSkillMap.has(h.skillName)) {
          pastSkillMap.set(h.skillName, {
            skillName: h.skillName,
            knowledgeScore: h.knowledgeScore,
            practiceScore: h.practiceScore,
            evidenceScore: h.evidenceScore,
          });
        }
      }
    }

    if (pastSkillMap.size > 0) {
      const pastSkillStates = Array.from(pastSkillMap.values());
      const pastProjects = projects.filter((p) => p.createdAt <= oneWeekAgo);
      const pastDiagnostic = validDiagnosticResult && validDiagnosticResult.completedAt && validDiagnosticResult.completedAt <= oneWeekAgo
        ? validDiagnosticResult
        : validDiagnosticResult;

      try {
        const previousReadiness = await getCareerReadiness(userId, {
          profile,
          skillStates: pastSkillStates,
          projects: pastProjects,
          latestDiagnostic: pastDiagnostic,
        });

        careerReadinessDelta = readinessResult.score - previousReadiness.score;
      } catch (err) {
        console.error("Failed to compute previous career readiness:", err);
      }
    }
  }

  // 7. Weekly Progress
  const weeklyProgress = {
    learning: activityLogs.find(a => a.type === "LEARNING")?._count._all || null,
    assessments: activityLogs.find(a => a.type === "ASSESSMENT")?._count._all || null,
    projects: activityLogs.find(a => a.type === "PROJECT")?._count._all || null,
    practice: activityLogs.find(a => a.type === "PRACTICE")?._count._all || null,
    careerReadiness: careerReadinessDelta,
  };

  // 8. Assessments (minimal summary)
  const pendingAssessments = (!validDiagnosticResult ? 1 : 0) + (currentMilestone ? 1 : 0);
  const assessmentsSummary = {
    pendingCount: pendingAssessments,
    completedCount: validDiagnosticResult ? 1 : 0,
  };

  // 9. Proof (summary with verified scores)
  const proofSummary = {
    trackedSkillsCount: skillStates.length,
    overallProofScore: evidenceVerification.overallProofScore,
    overallSkillScore: evidenceVerification.overallSkillScore,
    employerConfidenceSignal: evidenceVerification.employerConfidenceSignal,
  };

  // 10. Four Primary KPIs (Career Readiness, Skill Progress, Learning Progress, Proof Strength)
  const kpis = {
    targetRole,
    careerReadiness: readiness.score,
    skillProgress: evidenceVerification.overallSkillScore,
    learningProgress: roadmapDetails ? roadmapDetails.progress : 0,
    proofStrength: evidenceVerification.overallProofScore,
  };

  // 11. Career Alignment (minimal summary)
  const careerAlignment = {
    target: targetRole,
    isAvailable: skillStates.length > 0,
  };

  // 12. Application Readiness (minimal summary)
  const applicationReadiness = {
    isAvailable: skillStates.length > 0 && projects.length > 0,
  };

  // 13. Portfolio (minimal summary)
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
      weeklyAvailableHours: profile?.weeklyAvailableHours ?? 10,
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
