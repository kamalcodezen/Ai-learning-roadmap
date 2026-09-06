import prisma from "../../../../lib/prisma.js";

export const getProgress = async (userId: string) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 1. Fetch real activities and user history
  const [
    activityLogs,
    diagnosticAttempts,
    interviews,
    projects,
    skillStates,
    historyStates,
  ] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.diagnosticAttempt.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
    prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
    prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.skillState.findMany({
      where: { userId },
    }),
    prisma.skillStateHistory.findMany({
      where: { userId, createdAt: { lte: sevenDaysAgo } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // 2. Synthesize unified activity list
  const combinedActivities: Array<{
    id: string;
    type: "learning" | "assessment" | "project";
    title: string;
    date: string;
    description: string;
    timestamp: Date;
    estimatedMinutes: number;
  }> = [];

  // Add explicit activity logs
  activityLogs.forEach((log) => {
    let activityType: "learning" | "assessment" | "project" = "learning";
    const rawType = log.type.toLowerCase();
    if (rawType.includes("assessment") || rawType.includes("diagnostic") || rawType.includes("interview")) {
      activityType = "assessment";
    } else if (rawType.includes("project")) {
      activityType = "project";
    }

    const duration =
      typeof (log.metadata as any)?.durationMinutes === "number"
        ? (log.metadata as any).durationMinutes
        : activityType === "project" ? 60 : 30;

    const logDate = log.createdAt.toISOString().split("T")[0] || "";

    combinedActivities.push({
      id: log.id,
      type: activityType,
      title: log.type.charAt(0).toUpperCase() + log.type.slice(1).toLowerCase() + " Activity",
      date: logDate,
      description: log.description || "Activity completed",
      timestamp: log.createdAt,
      estimatedMinutes: duration,
    });
  });

  // If activity logs are few, backfill with attempts & projects
  if (combinedActivities.length < 5) {
    diagnosticAttempts.forEach((diag) => {
      const diagTimestamp = diag.completedAt || diag.startedAt;
      const diagDate = diagTimestamp.toISOString().split("T")[0] || "";
      const diagScore = diag.score !== null ? `${Math.round(diag.score)}%` : "completed";
      combinedActivities.push({
        id: `diag-${diag.id}`,
        type: "assessment",
        title: "Diagnostic Assessment",
        date: diagDate,
        description: `Diagnostic completed with score ${diagScore}`,
        timestamp: diagTimestamp,
        estimatedMinutes: 25,
      });
    });

    interviews.forEach((inv) => {
      const invTimestamp = inv.completedAt || inv.startedAt;
      const invDate = invTimestamp.toISOString().split("T")[0] || "";
      combinedActivities.push({
        id: `inv-${inv.id}`,
        type: "assessment",
        title: "Technical Interview Practice",
        date: invDate,
        description: `Interview session completed (${inv.status})`,
        timestamp: invTimestamp,
        estimatedMinutes: 30,
      });
    });

    projects.forEach((proj) => {
      const projDate = proj.createdAt.toISOString().split("T")[0] || "";
      combinedActivities.push({
        id: `proj-${proj.id}`,
        type: "project",
        title: proj.title || "Project Work",
        date: projDate,
        description: `Project created with stack: ${proj.techStack.join(", ") || "General"}`,
        timestamp: proj.createdAt,
        estimatedMinutes: 60,
      });
    });
  }

  // Sort unified activities descending by timestamp
  combinedActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // 3. Compute Streak
  const activeDays = new Set<string>();
  combinedActivities.forEach((a) => {
    if (a.date) activeDays.add(a.date);
  });

  let currentStreak = 0;
  const todayStr = now.toISOString().split("T")[0] || "";
  const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0] || "";

  let checkDate = (todayStr && activeDays.has(todayStr))
    ? new Date(now.getTime())
    : (yesterdayStr && activeDays.has(yesterdayStr))
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

  // 4. Compute Weekly & Monthly Hours
  let weeklyMinutes = 0;
  let monthlyMinutes = 0;

  combinedActivities.forEach((a) => {
    if (a.timestamp >= sevenDaysAgo) {
      weeklyMinutes += a.estimatedMinutes;
    }
    if (a.timestamp >= thirtyDaysAgo) {
      monthlyMinutes += a.estimatedMinutes;
    }
  });

  const weeklyHours = Math.round((weeklyMinutes / 60) * 10) / 10;
  const monthlyHours = Math.round((monthlyMinutes / 60) * 10) / 10;

  // 5. Compute Readiness Trend
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
      readinessTrend = Math.min(15, Math.round(currentAvg * 0.15));
    }
  }

  return {
    weeklyHours,
    monthlyHours,
    currentStreak,
    readinessTrend,
    recentActivity: combinedActivities.slice(0, 10).map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      date: a.date,
      description: a.description,
    })),
  };
};
