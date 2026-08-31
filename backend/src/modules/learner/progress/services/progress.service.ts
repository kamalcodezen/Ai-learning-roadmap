import prisma from "../../../../lib/prisma.js";

export const getProgress = async (userId: string) => {
  // 1. Fetch real activities for the user
  const activities = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  // 2. We use 0 for metrics (study time, streak, readiness) that do not yet have a direct real data source in PostgreSQL.
  return {
    weeklyHours: 0,
    monthlyHours: 0,
    currentStreak: 0,
    readinessTrend: 0,
    recentActivity: activities.map(a => ({
      id: a.id,
      type: a.type.toLowerCase() === "learning" || a.type.toLowerCase() === "practice" ? "learning" : a.type.toLowerCase() === "assessment" ? "assessment" : "project",
      title: a.type.charAt(0).toUpperCase() + a.type.slice(1).toLowerCase() + " Activity",
      date: a.createdAt.toISOString().split("T")[0],
      description: a.description || "Activity recorded"
    }))
  };
};
