import prisma from "../../../../lib/prisma.js";

export async function simulateRoadmapVelocity(userId: string, weeklyHours: number) {
  // Find user's active roadmap and unfinished milestones
  const activeRoadmap = await prisma.roadmap.findFirst({
    where: { userId },
    include: {
      milestones: true,
    },
    orderBy: { createdAt: "desc" },
  });

  let remainingHours = 120;
  let remainingMilestonesCount = 8;

  if (activeRoadmap && activeRoadmap.milestones.length > 0) {
    const unfinished = activeRoadmap.milestones.filter(
      (m) => m.status !== "COMPLETED"
    );
    if (unfinished.length > 0) {
      remainingMilestonesCount = unfinished.length;
      remainingHours = unfinished.reduce((sum, m) => sum + (m.estimatedHours || 15), 0);
    }
  }

  const hours = Math.max(3, Math.min(40, weeklyHours || 15));
  const estimatedWeeks = Math.max(1, Math.ceil(remainingHours / hours));
  const estimatedMonths = Number((estimatedWeeks / 4.3).toFixed(1));

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + estimatedWeeks * 7);

  let paceTitle = "Steady Pace";
  let paceBadge = "🌱 Steady Pace";
  if (hours >= 28) {
    paceTitle = "Immersive Bootcamp";
    paceBadge = "🏆 Immersive Bootcamp";
  } else if (hours >= 14) {
    paceTitle = "Accelerated Sprint";
    paceBadge = "⚡ Accelerated Sprint";
  }

  return {
    weeklyHours: hours,
    remainingHours,
    remainingMilestones: remainingMilestonesCount,
    estimatedWeeks,
    estimatedMonths,
    projectedDate: targetDate.toISOString(),
    paceTitle,
    paceBadge,
    velocityIndex: Number((hours / 10).toFixed(1)),
  };
}

export async function saveWeeklyCommitment(userId: string, weeklyHours: number) {
  const hours = Math.max(3, Math.min(40, weeklyHours));

  const profile = await prisma.careerProfile.upsert({
    where: { userId },
    create: {
      userId,
      weeklyAvailableHours: hours,
    },
    update: {
      weeklyAvailableHours: hours,
    },
  });

  return { success: true, weeklyAvailableHours: profile.weeklyAvailableHours };
}
