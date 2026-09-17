import prisma from "../../../../lib/prisma.js";

interface FormattedActivity {
  id: string;
  type: "learning" | "assessment" | "project";
  category: "Diagnostic" | "Simulation" | "Interview" | "Milestone" | "Project" | "Activity";
  title: string;
  date: string;
  formattedDate: string;
  description: string;
  timestamp: Date;
  estimatedMinutes: number;
  score?: number | null;
  status?: string;
}

/**
 * Format a Date object into a friendly relative/calendar label
 */
const formatDisplayDate = (d: Date): string => {
  try {
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d.toISOString().split("T")[0] || "";
  }
};

/**
 * Transforms raw activity log types into clean, professional titles and categories
 */
const cleanActivityTitle = (
  rawType: string,
  metadata: any,
  description: string = ""
): { title: string; category: FormattedActivity["category"] } => {
  const normType = (rawType || "").toUpperCase().trim();
  const descLower = (description || "").toLowerCase();

  if (normType === "SKILL_SIMULATION_ACTIVE") {
    const skill = metadata?.skill || "Skill";
    return {
      title: `${skill} Skill Simulation`,
      category: "Simulation",
    };
  }

  if (normType === "ASSESSMENT") {
    if (metadata?.assessmentType === "skill_simulation" || descLower.includes("skill simulation")) {
      const skill = metadata?.skill || "Skill";
      return {
        title: `${skill} Skill Simulation`,
        category: "Simulation",
      };
    }
    if (metadata?.totalQuestions || descLower.includes("diagnostic")) {
      return {
        title: "Diagnostic Assessment",
        category: "Diagnostic",
      };
    }
    return {
      title: "Assessment Completed",
      category: "Diagnostic",
    };
  }

  if (normType === "PRACTICE" || normType === "INTERVIEW") {
    return {
      title: "Technical Mock Interview",
      category: "Interview",
    };
  }

  if (normType === "PROJECT") {
    if (metadata?.title) {
      return {
        title: `Project: ${metadata.title}`,
        category: "Project",
      };
    }
    if (description.startsWith("Created project: ")) {
      return {
        title: description.replace("Created project: ", "Project: "),
        category: "Project",
      };
    }
    return {
      title: "Project Development",
      category: "Project",
    };
  }

  if (normType === "LEARNING" || normType === "ROADMAP") {
    if (metadata?.title) {
      return {
        title: `Milestone: ${metadata.title}`,
        category: "Milestone",
      };
    }
    if (descLower.includes("completed milestone: ")) {
      return {
        title: description.replace(/completed milestone:\s*/i, "Milestone: "),
        category: "Milestone",
      };
    }
    if (descLower.includes("generated complete learning roadmap")) {
      return {
        title: "Mastery Roadmap Generated",
        category: "Milestone",
      };
    }
    return {
      title: "Learning Milestone",
      category: "Milestone",
    };
  }

  if (normType === "ACHIEVEMENT_UNLOCKED") {
    return {
      title: metadata?.title ? `Achievement: ${metadata.title}` : "Achievement Unlocked",
      category: "Activity",
    };
  }

  // Generic fallback: format raw string without ugly underscores or "_activity Activity"
  const formatted = normType
    .replace(/_ACTIVITY$/, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: formatted.endsWith("Activity") ? formatted : `${formatted} Activity`,
    category: "Activity",
  };
};

export const getProgress = async (userId: string) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 1. Fetch real activities and user history concurrently
  const [
    activityLogs,
    diagnosticAttempts,
    interviews,
    projects,
    roadmaps,
    skillStates,
    historyStates,
    careerProfile,
    gamification,
  ] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.diagnosticAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 20,
    }),
    prisma.interviewSession.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 20,
    }),
    prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.roadmap.findMany({
      where: { userId },
      include: {
        milestones: {
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.skillState.findMany({
      where: { userId },
      orderBy: { lastReviewed: "desc" },
    }),
    prisma.skillStateHistory.findMany({
      where: { userId, createdAt: { lte: sevenDaysAgo } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.careerProfile.findUnique({
      where: { userId },
    }),
    prisma.userGamification.findUnique({
      where: { userId },
    }),
  ]);

  // 2. Synthesize unified activity list with smart deduplication
  const combinedActivities: FormattedActivity[] = [];
  const seenKeys = new Set<string>();

  // Process explicit activity logs
  activityLogs.forEach((log) => {
    let activityType: "learning" | "assessment" | "project" = "learning";
    const rawType = log.type.toLowerCase();

    if (
      rawType.includes("assessment") ||
      rawType.includes("diagnostic") ||
      rawType.includes("interview") ||
      rawType.includes("practice") ||
      rawType.includes("simulation")
    ) {
      activityType = "assessment";
    } else if (rawType.includes("project")) {
      activityType = "project";
    }

    const duration =
      typeof (log.metadata as any)?.durationMinutes === "number"
        ? (log.metadata as any).durationMinutes
        : activityType === "project"
          ? 60
          : activityType === "assessment"
            ? 20
            : 30;

    const logDate = log.createdAt.toISOString().split("T")[0] || "";
    const logTimeKey = `${logDate}-${log.createdAt.getHours()}:${Math.floor(log.createdAt.getMinutes() / 5)}`;
    const { title, category } = cleanActivityTitle(log.type, log.metadata, log.description || "");

    const uniqueKey = `${log.type}-${logTimeKey}-${(log.description || "").slice(0, 20)}`;
    seenKeys.add(uniqueKey);

    const score = (log.metadata as any)?.score ?? (log.metadata as any)?.overallScore ?? null;

    combinedActivities.push({
      id: log.id,
      type: activityType,
      category,
      title,
      date: logDate,
      formattedDate: formatDisplayDate(log.createdAt),
      description: log.description || "Activity completed",
      timestamp: log.createdAt,
      estimatedMinutes: duration,
      score: typeof score === "number" ? Math.round(score) : null,
    });
  });

  // Backfill with diagnostic attempts if not already registered via log
  diagnosticAttempts.forEach((diag) => {
    const diagTimestamp = diag.completedAt || diag.startedAt;
    const diagDate = diagTimestamp.toISOString().split("T")[0] || "";
    const diagScore = diag.score !== null ? Math.round(diag.score) : null;
    const timeKey = `${diagDate}-${diagTimestamp.getHours()}:${Math.floor(diagTimestamp.getMinutes() / 5)}`;
    const uniqueKey = `DIAGNOSTIC-${timeKey}-Diagnostic`;

    if (!seenKeys.has(uniqueKey)) {
      seenKeys.add(uniqueKey);
      combinedActivities.push({
        id: `diag-${diag.id}`,
        type: "assessment",
        category: "Diagnostic",
        title: "Diagnostic Assessment",
        date: diagDate,
        formattedDate: formatDisplayDate(diagTimestamp),
        description: `Diagnostic completed with score ${diagScore !== null ? `${diagScore}%` : "completed"}`,
        timestamp: diagTimestamp,
        estimatedMinutes: 25,
        score: diagScore,
      });
    }
  });

  // Backfill with completed interviews if not already registered
  interviews.forEach((inv) => {
    const invTimestamp = inv.completedAt || inv.startedAt;
    const invDate = invTimestamp.toISOString().split("T")[0] || "";
    const invScore = inv.score !== null ? Math.round(inv.score) : null;
    const timeKey = `${invDate}-${invTimestamp.getHours()}:${Math.floor(invTimestamp.getMinutes() / 5)}`;
    const uniqueKey = `PRACTICE-${timeKey}-Completed mock`;

    if (!seenKeys.has(uniqueKey)) {
      seenKeys.add(uniqueKey);
      combinedActivities.push({
        id: `inv-${inv.id}`,
        type: "assessment",
        category: "Interview",
        title: "Technical Mock Interview",
        date: invDate,
        formattedDate: formatDisplayDate(invTimestamp),
        description: `Interview session completed for ${inv.targetRole || "Role"}${invScore !== null ? ` (Score: ${invScore}%)` : ""}`,
        timestamp: invTimestamp,
        estimatedMinutes: 20,
        score: invScore,
      });
    }
  });

  // Backfill with projects
  projects.forEach((proj) => {
    const projDate = proj.createdAt.toISOString().split("T")[0] || "";
    const timeKey = `${projDate}-${proj.createdAt.getHours()}:${Math.floor(proj.createdAt.getMinutes() / 5)}`;
    const uniqueKey = `PROJECT-${timeKey}-${(proj.title || "").slice(0, 20)}`;

    if (!seenKeys.has(uniqueKey)) {
      seenKeys.add(uniqueKey);
      combinedActivities.push({
        id: `proj-${proj.id}`,
        type: "project",
        category: "Project",
        title: proj.title ? `Project: ${proj.title}` : "Project Work",
        date: projDate,
        formattedDate: formatDisplayDate(proj.createdAt),
        description: `Project built with: ${proj.techStack.join(", ") || "General Stack"}`,
        timestamp: proj.createdAt,
        estimatedMinutes: 60,
      });
    }
  });

  // Sort unified activities descending by timestamp
  combinedActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // 3. Compute Real Consecutive Day Streak
  const activeDays = new Set<string>();
  combinedActivities.forEach((a) => {
    if (a.date) activeDays.add(a.date);
  });

  let currentStreak = 0;
  const todayStr = now.toISOString().split("T")[0] || "";
  const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0] || "";

  let checkDate =
    todayStr && activeDays.has(todayStr)
      ? new Date(now.getTime())
      : yesterdayStr && activeDays.has(yesterdayStr)
        ? new Date(yesterdayDate.getTime())
        : null;

  if (checkDate) {
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0] || "";
      if (dateStr && activeDays.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // 4. Compute Weekly, Monthly & Total Study Hours
  let weeklyMinutes = 0;
  let monthlyMinutes = 0;
  let totalMinutes = 0;

  combinedActivities.forEach((a) => {
    totalMinutes += a.estimatedMinutes;
    if (a.timestamp >= sevenDaysAgo) {
      weeklyMinutes += a.estimatedMinutes;
    }
    if (a.timestamp >= thirtyDaysAgo) {
      monthlyMinutes += a.estimatedMinutes;
    }
  });

  const weeklyHours = Math.round((weeklyMinutes / 60) * 10) / 10;
  const monthlyHours = Math.round((monthlyMinutes / 60) * 10) / 10;
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // 5. Compute Dynamic Readiness Trend
  let readinessTrend = 0;
  if (skillStates.length > 0) {
    const currentAvg =
      skillStates.reduce((acc, s) => acc + (s.knowledgeScore + s.practiceScore + s.projectScore) / 3, 0) /
      skillStates.length;

    if (historyStates.length > 0) {
      const pastAvg =
        historyStates.reduce((acc, s) => acc + (s.knowledgeScore + s.practiceScore + s.projectScore) / 3, 0) /
        historyStates.length;
      readinessTrend = Math.max(0, Math.round(currentAvg - pastAvg));
    } else {
      readinessTrend = Math.min(25, Math.max(5, Math.round(currentAvg * 0.15)));
    }
  } else if (combinedActivities.length > 0) {
    // If skills are just being initialized, derive trend from completed assessments/milestones
    readinessTrend = Math.min(18, combinedActivities.length * 3);
  }

  // 6. Dynamic Skills Breakdown
  const skills = skillStates.map((s) => {
    const overallScore = Math.round((s.knowledgeScore + s.practiceScore + s.projectScore) / 3);
    let level = "Beginner";
    if (overallScore >= 80) level = "Advanced";
    else if (overallScore >= 50) level = "Intermediate";

    return {
      name: s.skillName,
      score: overallScore,
      knowledge: Math.round(s.knowledgeScore),
      practice: Math.round(s.practiceScore),
      project: Math.round(s.projectScore),
      level,
    };
  });

  // If no skill states, provide target role baseline competencies
  const targetRole = careerProfile?.targetRoleName || careerProfile?.targetRole || "Full Stack Developer";

  // 7. Aggregate Summary Stats
  const activeRoadmap = roadmaps.find((r) => r.status === "ACTIVE") || roadmaps[0];
  const allMilestones = activeRoadmap?.milestones || [];
  const completedMilestones = allMilestones.filter((m) => m.status === "COMPLETED").length;
  const totalMilestones = allMilestones.length;

  return {
    weeklyHours,
    monthlyHours,
    totalHours,
    currentStreak,
    readinessTrend,
    targetRole,
    summary: {
      completedMilestones,
      totalMilestones,
      completedProjects: projects.length,
      completedAssessments: diagnosticAttempts.length,
      completedInterviews: interviews.length,
      totalXp: gamification?.totalXp || 0,
      targetRole,
    },
    skills: skills.slice(0, 8),
    recentActivity: combinedActivities.slice(0, 15).map((a) => ({
      id: a.id,
      type: a.type,
      category: a.category,
      title: a.title,
      date: a.date,
      formattedDate: a.formattedDate,
      description: a.description,
      score: a.score,
      estimatedMinutes: a.estimatedMinutes,
    })),
  };
};
