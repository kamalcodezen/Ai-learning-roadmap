import prisma from "../../../../lib/prisma.js";

export async function getZeroGuiltRecoveryPlan(userId: string) {
  // Check user's last activity
  const latestActivity = await prisma.activityLog.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const lastActive = latestActivity ? new Date(latestActivity.createdAt) : new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
  const diffDays = Math.max(0, Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)));

  const isRecoveryActive = diffDays >= 7;

  const plan = [
    {
      day: 1,
      duration: "5 Mins",
      title: "Concept Warm-Up Refresher",
      subtitle: "Quick digest of the key concepts you mastered before your break.",
      type: "Memory Warm-Up",
      taskDetail: "Review: Asynchronous JavaScript, Event Loop & Promises overview.",
    },
    {
      day: 2,
      duration: "10 Mins",
      title: "Micro Confidence Puzzle",
      subtitle: "A low-friction practical quiz to reactivate your problem-solving reflex.",
      type: "Confidence Booster",
      taskDetail: "Solve: 3 quick logic prompts on Array.reduce & state immutability.",
    },
    {
      day: 3,
      duration: "12 Mins",
      title: "Resume Milestone Frontier",
      subtitle: "Complete the very first small step of your active milestone.",
      type: "Frontier Step",
      taskDetail: "Action: Scaffold your React Custom Hook component structure.",
    },
    {
      day: 4,
      duration: "8 Mins",
      title: "Momentum Lock-in (+50 XP)",
      subtitle: "Celebrate your resilience and seamlessly return to your normal path.",
      type: "Habit Locked",
      taskDetail: "Milestone: Sync your progress and collect +50 Resilience XP bonus.",
    },
  ];

  return {
    daysInactive: diffDays,
    isRecoveryActive,
    streakShieldActive: true,
    bonusXpAmount: 50,
    plan,
  };
}

export async function claimResilienceBonus(userId: string) {
  const bonusXp = 50;

  // Award XP via UserGamification
  const gamification = await prisma.userGamification.upsert({
    where: { userId },
    create: {
      userId,
      xp: bonusXp,
      level: 1,
    },
    update: {
      xp: { increment: bonusXp },
    },
  });

  // Record XP Transaction
  await prisma.xPTransaction.create({
    data: {
      userId,
      amount: bonusXp,
      reason: "ZERO_GUILT_RESILIENCE_BONUS",
      metadata: { source: "4_day_recovery_plan" },
    },
  });

  return {
    success: true,
    awardedXp: bonusXp,
    currentTotalXp: gamification.xp,
  };
}
