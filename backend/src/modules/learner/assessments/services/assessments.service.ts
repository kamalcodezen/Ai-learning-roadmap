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
    }),
    prisma.activityLog.findMany({
      where: {
        userId,
        type: "ASSESSMENT",
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Helper to determine if an activity log represents a genuine completed skill simulation
  const isSkillSimulationLog = (l: any): boolean => {
    const meta = l.metadata as any;
    if (!meta || typeof meta !== "object") return false;
    const isSim = meta.assessmentType === "skill_simulation" || meta.overallScore !== undefined;
    const hasSkill = typeof meta.skill === "string" && meta.skill.trim().length > 0;
    return Boolean(isSim && hasSkill);
  };

  // 2. Compute completed counts and scores
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

  // 3. Map real assessments
  const assessments: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    score?: number | undefined;
    description: string;
    href: string;
    skillAssociated?: string | undefined;
  }> = [];

  // Map Diagnostics
  attempts.forEach((a) => {
    assessments.push({
      id: `diag-${a.id}`,
      title: a.targetRole
        ? `${a.targetRole} Diagnostic Assessment`
        : "Diagnostic Baseline Assessment",
      type: "diagnostic",
      status: a.status === "COMPLETED" ? "completed" : "in_progress",
      score: a.score !== null ? a.score : undefined,
      description: "Comprehensive evaluation of foundational role readiness and skill mastery.",
      href: a.status === "COMPLETED" ? "/dashboard/learner/career-twin" : "/diagnostic",
    });
  });

  // Map Mock Interviews
  interviews.forEach((inv) => {
    assessments.push({
      id: `inv-${inv.id}`,
      title: inv.targetRole
        ? `${inv.targetRole} AI Mock Interview`
        : "Technical Mock Interview",
      type: "interview",
      status: inv.status === "COMPLETED" ? "completed" : "in_progress",
      score: inv.score !== null ? Math.round(inv.score) : undefined,
      description: "Interactive AI-driven technical evaluation with real-time feedback.",
      href: "/dashboard/learner/interview",
    });
  });

  // Map Dynamic Skill Mastery Simulations
  // Build a distinct list of candidate skills from skillStates, required role skills, and simulation logs
  const targetRole = profile?.targetRoleName || profile?.targetRole || "Full Stack Developer";
  const requiredSkills = getRequiredSkillsForRole(targetRole);

  const candidateSkills: Array<{
    id: string;
    skillName: string;
    sortPriority: number; // lower means higher priority (e.g. gaps first)
  }> = [];

  const registeredSkills = new Set<string>();

  // Add existing SkillStates first (prioritizing the learner's actual active skills)
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

  // Ensure role required skills (e.g., HTML, SQL, Node.js) are also available
  for (const req of requiredSkills) {
    const key = req.skill.toLowerCase().trim();
    const alreadyPresent = Array.from(registeredSkills).some((k) => isMatchingSkill(k, req.skill));
    if (!alreadyPresent) {
      registeredSkills.add(key);
      candidateSkills.push({
        id: `req-${req.skill.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        skillName: req.skill,
        sortPriority: 100, // Unseeded required skills follow active skills
      });
    }
  }

  // Sort candidate skills (critical gaps first) and take up to 10 skills
  candidateSkills.sort((a, b) => a.sortPriority - b.sortPriority);
  const displaySkills = candidateSkills.slice(0, 10);

  displaySkills.forEach((skill) => {
    // Check if this skill has an authentic completed simulation log
    const matchingLog = simulationLogs.find((l) => {
      if (!isSkillSimulationLog(l)) return false;
      const meta = l.metadata as any;
      return isMatchingSkill(meta.skill, skill.skillName);
    });

    // CANONICAL RULE:
    // A skill simulation is ONLY completed if a genuine persisted simulation result exists in ActivityLog.
    // NEVER use skill.knowledgeScore >= 70 as proof of completion.
    const isCompleted = Boolean(matchingLog);
    const resolvedScore = matchingLog
      ? (Number((matchingLog.metadata as any)?.overallScore) || Number((matchingLog.metadata as any)?.score) || 0)
      : undefined;

    const status = isCompleted ? "completed" : "not_started";
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
    });
  });

  // 4. Placeholder if empty
  if (assessments.length === 0) {
    assessments.push({
      id: "placeholder-1",
      title: "Initial Diagnostic Assessment",
      type: "diagnostic",
      status: "not_started",
      score: undefined,
      description: "Baseline evaluation of your current development skills.",
      href: "/diagnostic",
    });
  }

  return {
    completedCount,
    averageScore,
    assessments,
  };
};
