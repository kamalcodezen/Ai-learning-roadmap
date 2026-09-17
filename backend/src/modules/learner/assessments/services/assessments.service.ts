import prisma from "../../../../lib/prisma.js";
import { getRequiredSkillsForRole } from "../../career-alignment/services/career-skills.map.js";
import { isMatchingSkill } from "./skill-simulation.service.js";

export const getAssessments = async (userId: string) => {
  // 1. Fetch real diagnostic attempts, interview sessions, skill states, career profile, and simulation logs
  const [profile, attempts, interviews, skillStates, simulationLogs] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.diagnosticAttempt.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
    }),
    prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
    }),
    prisma.skillState.findMany({
      where: { userId },
      orderBy: { lastReviewed: "desc" },
    }),
    prisma.activityLog.findMany({
      where: {
        userId,
        type: "ASSESSMENT",
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const targetRole = profile?.targetRoleName || profile?.targetRole || "Full Stack Developer";

  // Helper to determine if an activity log represents a genuine completed skill simulation
  const isSkillSimulationLog = (l: any): boolean => {
    const meta = l.metadata as any;
    if (!meta || typeof meta !== "object") return false;
    const isSim = meta.assessmentType === "skill_simulation" || meta.overallScore !== undefined;
    const hasSkill = typeof meta.skill === "string" && meta.skill.trim().length > 0;
    return Boolean(isSim && hasSkill);
  };

  // 2. Compute completed counts and real scores
  const completedDiagnostics = attempts.filter(
    (a) => a.status === "COMPLETED" && a.score !== null,
  );
  const completedInterviews = interviews.filter(
    (i) => i.status === "COMPLETED" && i.score !== null,
  );
  const completedSimulations = simulationLogs.filter(isSkillSimulationLog);

  const completedCount = completedDiagnostics.length + completedInterviews.length + completedSimulations.length;

  const allScores = [
    ...completedDiagnostics.map((a) => a.score as number),
    ...completedInterviews.map((i) => i.score as number),
    ...completedSimulations.map(
      (l) => Number((l.metadata as any)?.overallScore) || Number((l.metadata as any)?.score) || 0,
    ),
  ];

  const averageScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

  const passedCount = allScores.filter((s) => s >= 70).length;

  // 3. Map real assessments
  const assessments: Array<{
    id: string;
    title: string;
    type: "diagnostic" | "skill_test" | "interview";
    status: "completed" | "in_progress" | "not_started";
    score?: number | undefined;
    description: string;
    href: string;
    skillAssociated?: string | undefined;
    duration?: string | undefined;
    attemptLabel?: string | undefined;
    completedAt?: string | undefined;
  }> = [];

  // Map Diagnostics with Attempt Labels and Dates
  attempts.forEach((a, index) => {
    const attemptNum = attempts.length - index;
    const isLatest = index === 0;
    const isCompleted = a.status === "COMPLETED";
    const dateFormatted = a.completedAt
      ? new Date(a.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : undefined;

    assessments.push({
      id: `diag-${a.id}`,
      title: a.targetRole
        ? `${a.targetRole} Diagnostic Assessment`
        : `${targetRole} Diagnostic Assessment`,
      type: "diagnostic",
      status: isCompleted ? "completed" : "in_progress",
      score: a.score !== null ? a.score : undefined,
      description: isLatest
        ? "Comprehensive evaluation of foundational role readiness, architecture knowledge, and core skills."
        : `Diagnostic evaluation benchmark (Attempt #${attemptNum}).`,
      href: isCompleted ? "/dashboard/learner/career-twin" : "/diagnostic",
      attemptLabel: attempts.length > 1 ? (isLatest ? `Attempt #${attemptNum} (Latest)` : `Attempt #${attemptNum}`) : undefined,
      completedAt: dateFormatted,
      duration: "4 Stages • ~10m",
    });
  });

  // Map Mock Interviews
  interviews.forEach((inv) => {
    const isCompleted = inv.status === "COMPLETED";
    const invDate = inv.completedAt || inv.startedAt;
    const dateFormatted = invDate
      ? new Date(invDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : undefined;

    assessments.push({
      id: `inv-${inv.id}`,
      title: inv.targetRole
        ? `${inv.targetRole} AI Mock Interview`
        : `${targetRole} AI Mock Interview`,
      type: "interview",
      status: isCompleted ? "completed" : "in_progress",
      score: inv.score !== null ? Math.round(inv.score) : undefined,
      description: "Interactive AI-driven technical evaluation with real-time feedback and rubric scoring.",
      href: "/dashboard/learner/interview",
      completedAt: dateFormatted,
      duration: "Voice & Text • ~15m",
    });
  });

  // Map Dynamic Skill Mastery Simulations
  const requiredSkills = getRequiredSkillsForRole(targetRole);

  const candidateSkills: Array<{
    id: string;
    skillName: string;
    sortPriority: number;
  }> = [];

  const registeredSkills = new Set<string>();

  // Add existing SkillStates first (prioritizing user's tracked skills and gaps)
  for (const state of skillStates) {
    const key = state.skillName.toLowerCase().trim();
    if (!registeredSkills.has(key)) {
      registeredSkills.add(key);
      const avgScore = (state.knowledgeScore + state.practiceScore) / 2;
      candidateSkills.push({
        id: state.id,
        skillName: state.skillName,
        sortPriority: avgScore,
      });
    }
  }

  // Ensure role required skills (e.g., React, SQL, Node.js, System Design) are present
  for (const req of requiredSkills) {
    const key = req.skill.toLowerCase().trim();
    const alreadyPresent = Array.from(registeredSkills).some((k) => isMatchingSkill(k, req.skill));
    if (!alreadyPresent) {
      registeredSkills.add(key);
      candidateSkills.push({
        id: `req-${req.skill.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        skillName: req.skill,
        sortPriority: 100,
      });
    }
  }

  // Sort candidate skills (gaps first) and display top skills
  candidateSkills.sort((a, b) => a.sortPriority - b.sortPriority);
  const displaySkills = candidateSkills.slice(0, 12);

  displaySkills.forEach((skill) => {
    // Check if this skill has an authentic completed simulation log
    const matchingLog = simulationLogs.find((l) => {
      if (!isSkillSimulationLog(l)) return false;
      const meta = l.metadata as any;
      return isMatchingSkill(meta.skill, skill.skillName);
    });

    const isCompleted = Boolean(matchingLog);
    const resolvedScore = matchingLog
      ? (Number((matchingLog.metadata as any)?.overallScore) || Number((matchingLog.metadata as any)?.score) || 0)
      : undefined;

    const completedDate = matchingLog?.createdAt
      ? new Date(matchingLog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : undefined;

    const status: "completed" | "not_started" = isCompleted ? "completed" : "not_started";
    const href = isCompleted
      ? `/dashboard/learner/assessments/simulation?skill=${encodeURIComponent(skill.skillName)}&review=true`
      : `/dashboard/learner/assessments/simulation?skill=${encodeURIComponent(skill.skillName)}`;

    assessments.push({
      id: `gap-eval-${skill.id}`,
      title: `${skill.skillName} Mastery Check`,
      type: "skill_test",
      status,
      score: isCompleted ? resolvedScore : undefined,
      description: isCompleted
        ? `Practical 4-stage skill evaluation completed with verified score.`
        : `Targeted 4-stage simulation (Understand, Debug, Code, Explain) to validate ${skill.skillName}.`,
      skillAssociated: skill.skillName,
      href,
      duration: "4 Stages • ~10m",
      completedAt: completedDate,
    });
  });

  // Default placeholder if empty
  if (assessments.length === 0) {
    assessments.push({
      id: "placeholder-1",
      title: `${targetRole} Diagnostic Assessment`,
      type: "diagnostic",
      status: "not_started",
      score: undefined,
      description: "Baseline evaluation of your current development skills and foundational knowledge.",
      href: "/diagnostic",
      duration: "4 Stages • ~10m",
    });
  }

  const pendingCount = assessments.filter((a) => a.status !== "completed").length;

  return {
    completedCount,
    averageScore,
    passedCount,
    pendingCount,
    targetRole,
    assessments,
  };
};
