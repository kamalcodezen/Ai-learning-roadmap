import prisma from "../../../../lib/prisma.js";
import {
  ACHIEVEMENT_CATALOG,
  LEVEL_TIERS,
  type AchievementDefinition,
  type LevelInfo,
  type XPActionType,
} from "../gamification.types.js";

// ============================================================
// LEVEL CALCULATION
// ============================================================

export const calculateLevel = (totalXp: number): LevelInfo => {
  const fallbackTier = { level: 1, title: "Novice Pather", minXp: 0 };
  let currentTier = LEVEL_TIERS[0] ?? fallbackTier;
  let nextTier = LEVEL_TIERS[1] ?? { level: 2, title: "Code Explorer", minXp: 100 };

  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    const tier = LEVEL_TIERS[i];
    if (tier && totalXp >= tier.minXp) {
      currentTier = tier;
      nextTier = LEVEL_TIERS[i + 1] || {
        level: currentTier.level + 1,
        title: currentTier.title,
        minXp: currentTier.minXp + 2000,
      };
      break;
    }
  }

  const xpInLevel = totalXp - currentTier.minXp;
  const xpNeeded = Math.max(1, nextTier.minXp - currentTier.minXp);
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInLevel / xpNeeded) * 100)));

  return {
    level: currentTier.level,
    title: currentTier.title,
    minXp: currentTier.minXp,
    nextLevelXp: nextTier.minXp,
    currentProgressXp: totalXp,
    progressPercent,
  };
};

// ============================================================
// IDEMPOTENT XP AWARDING
// ============================================================

export interface AwardXpResult {
  awarded: boolean;
  awardedAmount: number;
  totalXp: number;
  levelInfo: LevelInfo;
  leveledUp: boolean;
}

export const awardXp = async (
  userId: string,
  actionType: XPActionType,
  referenceId: string,
  amount: number,
  description: string,
): Promise<AwardXpResult> => {
  // 1. Check if this exact action was already awarded
  const existingTx = await prisma.xPTransaction.findUnique({
    where: {
      userId_actionType_referenceId: {
        userId,
        actionType,
        referenceId,
      },
    },
  });

  if (existingTx) {
    const currentGamification = await prisma.userGamification.findUnique({
      where: { userId },
    });
    const totalXp = currentGamification?.totalXp ?? 0;
    return {
      awarded: false,
      awardedAmount: 0,
      totalXp,
      levelInfo: calculateLevel(totalXp),
      leveledUp: false,
    };
  }

  // 2. Perform atomic transaction
  try {
    return await prisma.$transaction(async (tx) => {
      // Record immutable ledger entry
      await tx.xPTransaction.create({
        data: {
          userId,
          actionType,
          referenceId,
          amount,
          description,
        },
      });

      // Get or create current gamification
      const currentGamification = await tx.userGamification.findUnique({
        where: { userId },
      });

      const previousTotalXp = currentGamification?.totalXp ?? 0;
      const newTotalXp = previousTotalXp + amount;
      const newLevelInfo = calculateLevel(newTotalXp);

      await tx.userGamification.upsert({
        where: { userId },
        update: {
          totalXp: newTotalXp,
          currentLevel: newLevelInfo.level,
        },
        create: {
          userId,
          totalXp: newTotalXp,
          currentLevel: newLevelInfo.level,
        },
      });

      const previousLevel = calculateLevel(previousTotalXp).level;
      const leveledUp = newLevelInfo.level > previousLevel;

      return {
        awarded: true,
        awardedAmount: amount,
        totalXp: newTotalXp,
        levelInfo: newLevelInfo,
        leveledUp,
      };
    }, {
      maxWait: 10000,
      timeout: 15000,
    });
  } catch (err: any) {
    if (err?.code === "P2002" || err?.message?.includes("Unique constraint")) {
      const currentGamification = await prisma.userGamification.findUnique({
        where: { userId },
      });
      const totalXp = currentGamification?.totalXp ?? 0;
      return {
        awarded: false,
        awardedAmount: 0,
        totalXp,
        levelInfo: calculateLevel(totalXp),
        leveledUp: false,
      };
    }
    throw err;
  }
};

// ============================================================
// DETERMINISTIC ACHIEVEMENT EVALUATION
// ============================================================

export const evaluateAchievements = async (userId: string) => {
  const [
    diagnosticAttempts,
    roadmaps,
    projects,
    projectEvidence,
    interviewSessions,
    skillStates,
    existingAchievements,
  ] = await Promise.all([
    prisma.diagnosticAttempt.findMany({ where: { userId, status: "COMPLETED" } }),
    prisma.roadmap.findMany({
      where: { userId },
      include: { milestones: true },
    }),
    prisma.project.findMany({ where: { userId } }),
    prisma.projectEvidence.findMany({ where: { userId } }),
    prisma.interviewSession.findMany({ where: { userId, status: "COMPLETED" } }),
    prisma.skillState.findMany({ where: { userId } }),
    prisma.userAchievement.findMany({ where: { userId } }),
  ]);

  const existingCodes = new Set(existingAchievements.map((a) => a.achievementCode));
  const newlyUnlocked: AchievementDefinition[] = [];

  // 1. FIRST_DIAGNOSTIC
  if (!existingCodes.has("FIRST_DIAGNOSTIC") && diagnosticAttempts.length > 0) {
    const def = ACHIEVEMENT_CATALOG.find((a) => a.code === "FIRST_DIAGNOSTIC")!;
    newlyUnlocked.push(def);
  }

  // 2. FIRST_MILESTONE
  const completedMilestonesCount = roadmaps.flatMap((r) => r.milestones).filter((m) => m.status === "COMPLETED").length;
  if (!existingCodes.has("FIRST_MILESTONE") && completedMilestonesCount > 0) {
    const def = ACHIEVEMENT_CATALOG.find((a) => a.code === "FIRST_MILESTONE")!;
    newlyUnlocked.push(def);
  }

  // 3. FIRST_PROJECT
  if (!existingCodes.has("FIRST_PROJECT") && projects.length > 0) {
    const def = ACHIEVEMENT_CATALOG.find((a) => a.code === "FIRST_PROJECT")!;
    newlyUnlocked.push(def);
  }

  // 4. FIRST_VERIFIED_EVIDENCE
  const hasVerifiedProjectOrEvidence =
    projects.some((p) => p.isVerified) || projectEvidence.length > 0;
  if (!existingCodes.has("FIRST_VERIFIED_EVIDENCE") && hasVerifiedProjectOrEvidence) {
    const def = ACHIEVEMENT_CATALOG.find((a) => a.code === "FIRST_VERIFIED_EVIDENCE")!;
    newlyUnlocked.push(def);
  }

  // 5. FIRST_INTERVIEW
  if (!existingCodes.has("FIRST_INTERVIEW") && interviewSessions.length > 0) {
    const def = ACHIEVEMENT_CATALOG.find((a) => a.code === "FIRST_INTERVIEW")!;
    newlyUnlocked.push(def);
  }

  // 6. SKILL_APPRENTICE
  const hasApprenticeSkill = skillStates.some((s) => s.knowledgeScore >= 70);
  if (!existingCodes.has("SKILL_APPRENTICE") && hasApprenticeSkill) {
    const def = ACHIEVEMENT_CATALOG.find((a) => a.code === "SKILL_APPRENTICE")!;
    newlyUnlocked.push(def);
  }

  // 7. SKILL_MASTER
  const masteredSkillsCount = skillStates.filter((s) => {
    const composite = Math.round(
      s.knowledgeScore * 0.4 + s.practiceScore * 0.3 + s.projectScore * 0.3,
    );
    return composite >= 80;
  }).length;
  if (!existingCodes.has("SKILL_MASTER") && masteredSkillsCount >= 3) {
    const def = ACHIEVEMENT_CATALOG.find((a) => a.code === "SKILL_MASTER")!;
    newlyUnlocked.push(def);
  }

  // 8. CAREER_READY
  const totalScore = skillStates.length
    ? skillStates.reduce(
        (acc, s) =>
          acc +
          (s.knowledgeScore * 0.35 +
            s.practiceScore * 0.3 +
            s.projectScore * 0.2 +
            s.evidenceScore * 0.15),
        0,
      ) / skillStates.length
    : 0;
  if (!existingCodes.has("CAREER_READY") && skillStates.length >= 3 && totalScore >= 75) {
    const def = ACHIEVEMENT_CATALOG.find((a) => a.code === "CAREER_READY")!;
    newlyUnlocked.push(def);
  }

  // Unlock and award XP for all newly qualified achievements
  for (const ach of newlyUnlocked) {
    try {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementCode: ach.code,
          title: ach.title,
          description: ach.description,
          badgeIcon: ach.badgeIcon,
          category: ach.category,
          xpReward: ach.xpReward,
        },
      });

      // Award bonus XP for unlocking achievement
      await awardXp(
        userId,
        "ACHIEVEMENT_UNLOCKED",
        ach.code,
        ach.xpReward,
        `Unlocked achievement: ${ach.title}`,
      );
    } catch (err) {
      // Ignore unique violation if race condition
    }
  }

  return newlyUnlocked;
};

// ============================================================
// GET FULL GAMIFICATION PROFILE
// ============================================================

export const getUserGamificationProfile = async (userId: string) => {
  // First evaluate any eligible achievements
  await evaluateAchievements(userId);

  const [gamification, userAchievements, xpTransactions] = await Promise.all([
    prisma.userGamification.findUnique({ where: { userId } }),
    prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
    }),
    prisma.xPTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const totalXp = gamification?.totalXp ?? 0;
  const levelInfo = calculateLevel(totalXp);
  const unlockedMap = new Map(userAchievements.map((a) => [a.achievementCode, a]));

  const catalogWithStatus = ACHIEVEMENT_CATALOG.map((def) => {
    const unlocked = unlockedMap.get(def.code);
    return {
      ...def,
      isUnlocked: !!unlocked,
      unlockedAt: unlocked?.unlockedAt ?? null,
    };
  });

  return {
    totalXp,
    levelInfo,
    achievements: catalogWithStatus,
    unlockedCount: userAchievements.length,
    totalAchievementsCount: ACHIEVEMENT_CATALOG.length,
    recentXpTransactions: xpTransactions,
  };
};
