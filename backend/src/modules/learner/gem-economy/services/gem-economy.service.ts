import prisma from "../../../../lib/prisma.js";
import {
  type AwardGemsResult,
  type DailyStreakStatus,
  type GemSourceType,
  type GemTransactionItem,
  type GemWalletSummary,
  type StreakLadderDay,
} from "../gem-economy.types.js";

/**
 * Gem reward scaling for 7-day streak ladder:
 * Day 1–3: 1 Gem (starting momentum)
 * Day 4–6: 2 Gems (consistency bonus)
 * Day 7: 5 Gems (major milestone reward)
 */
export function getGemsForStreakDay(day: number): number {
  const boundedDay = ((Math.max(1, Math.round(day)) - 1) % 7) + 1;
  if (boundedDay <= 3) return 1;
  if (boundedDay <= 6) return 2;
  return 5;
}

/**
 * Returns YYYY-MM-DD string in UTC to safely partition calendar days
 */
function getUtcDateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0]!;
}

/**
 * Retrieves or initializes learner's Gem wallet summary with live data from database.
 */
export async function getGemWallet(userId: string): Promise<GemWalletSummary> {
  // Ensure UserGamification row exists with default 10 gems
  const gamification = await prisma.userGamification.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      totalXp: 0,
      currentLevel: 1,
      gemsBalance: 10,
    },
    select: {
      gemsBalance: true,
    },
  });

  const gemsBalance = gamification?.gemsBalance ?? 10;

  // Retrieve last 15 streak transactions to compute streak accurately
  const streakTransactions = await prisma.gemTransaction.findMany({
    where: {
      userId,
      source: "DAILY_STREAK",
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const todayStr = getUtcDateString();
  const yesterdayStr = getUtcDateString(new Date(Date.now() - 86400000));

  let todayClaimed = false;
  let lastClaimDate: string | null = null;
  let currentStreakDays = 0;

  if (streakTransactions.length > 0) {
    const latestTx = streakTransactions[0]!;
    lastClaimDate = latestTx.createdAt.toISOString();
    const latestTxDateStr = getUtcDateString(new Date(latestTx.createdAt));

    if (latestTxDateStr === todayStr) {
      todayClaimed = true;
      // Streak count is based on consecutive days
      currentStreakDays = countConsecutiveDays(streakTransactions, todayStr);
    } else if (latestTxDateStr === yesterdayStr) {
      // Streak is unbroken, awaiting today's claim
      currentStreakDays = countConsecutiveDays(streakTransactions, yesterdayStr);
    } else {
      // Gap > 1 day, streak reset to 0
      currentStreakDays = 0;
    }
  }

  const nextStreakDay = todayClaimed
    ? ((currentStreakDays - 1) % 7) + 1
    : ((currentStreakDays % 7) + 1);

  const todayRewardGems = getGemsForStreakDay(nextStreakDay);

  // Build 7-day visual ladder
  const streakLadder: StreakLadderDay[] = [1, 2, 3, 4, 5, 6, 7].map((d) => {
    const isPastClaimed = todayClaimed ? d <= nextStreakDay : d < nextStreakDay;
    const isCurrent = todayClaimed ? d === nextStreakDay : d === nextStreakDay;
    return {
      day: d,
      gems: getGemsForStreakDay(d),
      claimed: isPastClaimed,
      isCurrent,
    };
  });

  const streakStatus: DailyStreakStatus = {
    currentStreakDays,
    todayClaimed,
    todayRewardGems,
    nextStreakDay,
    streakLadder,
    lastClaimDate,
  };

  // Compute lifetime gems earned
  const totalEarnedAggregate = await prisma.gemTransaction.aggregate({
    where: {
      userId,
      amount: { gt: 0 },
    },
    _sum: {
      amount: true,
    },
  });

  const lifetimeGemsEarned = (totalEarnedAggregate._sum.amount ?? 0) + 10; // includes 10 welcome gems

  // Retrieve recent 5 transactions
  const recentRawTransactions = await prisma.gemTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentTransactions: GemTransactionItem[] = recentRawTransactions.map((tx) => ({
    id: tx.id,
    amount: tx.amount,
    source: tx.source,
    description: tx.description,
    referenceId: tx.referenceId,
    balanceAfter: tx.balanceAfter,
    createdAt: tx.createdAt.toISOString(),
  }));

  return {
    gemsBalance,
    lifetimeGemsEarned,
    streak: streakStatus,
    recentTransactions,
  };
}

/**
 * Helper to count consecutive daily claim dates from sorted transactions
 */
function countConsecutiveDays(transactions: { createdAt: Date }[], startingDateStr: string): number {
  let count = 0;
  let expectedDate = new Date(startingDateStr + "T00:00:00Z");

  for (const tx of transactions) {
    const txDateStr = getUtcDateString(new Date(tx.createdAt));
    const expectedDateStr = getUtcDateString(expectedDate);

    if (txDateStr === expectedDateStr) {
      count++;
      expectedDate = new Date(expectedDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return Math.max(1, count);
}

/**
 * Claims today's daily streak gem idempotently and dispatches an in-app notification.
 */
export async function claimDailyStreakGems(userId: string): Promise<{
  success: boolean;
  awardedGems: number;
  newBalance: number;
  streakDay: number;
  message: string;
}> {
  const wallet = await getGemWallet(userId);

  if (wallet.streak.todayClaimed) {
    return {
      success: false,
      awardedGems: 0,
      newBalance: wallet.gemsBalance,
      streakDay: wallet.streak.nextStreakDay,
      message: "Daily streak reward already claimed for today. Come back tomorrow!",
    };
  }

  const streakDay = wallet.streak.nextStreakDay;
  const gemReward = getGemsForStreakDay(streakDay);

  // Perform atomic crediting
  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.userGamification.findUnique({
      where: { userId },
      select: { gemsBalance: true },
    });

    const previousBalance = current?.gemsBalance ?? 10;
    const newBalance = previousBalance + gemReward;

    await tx.userGamification.upsert({
      where: { userId },
      update: { gemsBalance: newBalance },
      create: {
        userId,
        totalXp: 0,
        currentLevel: 1,
        gemsBalance: newBalance,
      },
    });

    await tx.gemTransaction.create({
      data: {
        userId,
        amount: gemReward,
        source: "DAILY_STREAK",
        referenceId: `STREAK_DAY_${streakDay}_${getUtcDateString()}`,
        description: `Daily Streak Day ${streakDay} Reward (+${gemReward} 💎)`,
        balanceAfter: newBalance,
      },
    });

    await tx.activityLog.create({
      data: {
        userId,
        type: "DAILY_STREAK_CLAIMED",
        description: `Claimed Day ${streakDay} streak bonus (+${gemReward} 💎)`,
        metadata: {
          streakDay,
          gemReward,
          balanceAfter: newBalance,
          claimedAt: new Date().toISOString(),
        },
      },
    });

    return { newBalance, streakDay, gemReward };
  });

  // Dispatch live in-app notification
  try {
    const { createNotification } = await import("../../notifications/services/notification.service.js");
    await createNotification({
      userId,
      type: "ACHIEVEMENT",
      title: "Daily Streak Reward 💎",
      message: `Awesome! You claimed Day ${result.streakDay} streak bonus and earned +${result.gemReward} 💎. Keep up the momentum!`,
      metadata: {
        streakDay: result.streakDay,
        gemsAwarded: result.gemReward,
        newBalance: result.newBalance,
      },
    });
  } catch (err) {
    // Non-blocking
  }

  return {
    success: true,
    awardedGems: result.gemReward,
    newBalance: result.newBalance,
    streakDay: result.streakDay,
    message: `Earned +${result.gemReward} 💎 for Day ${result.streakDay} streak!`,
  };
}

/**
 * Universal atomic gem awarding helper used across all role-based modules
 * (Milestone completed, mock interview passed, GitHub project verified, recovery mode).
 */
export async function awardGems(
  userId: string,
  amount: number,
  source: GemSourceType,
  description: string,
  referenceId?: string
): Promise<AwardGemsResult> {
  const safeAmount = Math.max(1, Math.round(amount));

  const result = await prisma.$transaction(async (tx) => {
    // Check if idempotent award with this reference already exists
    if (referenceId) {
      const existing = await tx.gemTransaction.findFirst({
        where: {
          userId,
          source,
          referenceId,
        },
      });

      if (existing) {
        const current = await tx.userGamification.findUnique({
          where: { userId },
          select: { gemsBalance: true },
        });
        return {
          awarded: false,
          awardedAmount: 0,
          gemsBalance: current?.gemsBalance ?? 10,
          source,
          description,
        };
      }
    }

    const current = await tx.userGamification.findUnique({
      where: { userId },
      select: { gemsBalance: true },
    });

    const previousBalance = current?.gemsBalance ?? 10;
    const newBalance = previousBalance + safeAmount;

    await tx.userGamification.upsert({
      where: { userId },
      update: { gemsBalance: newBalance },
      create: {
        userId,
        totalXp: 0,
        currentLevel: 1,
        gemsBalance: newBalance,
      },
    });

    await tx.gemTransaction.create({
      data: {
        userId,
        amount: safeAmount,
        source,
        referenceId: referenceId || null,
        description,
        balanceAfter: newBalance,
      },
    });

    await tx.activityLog.create({
      data: {
        userId,
        type: "GEMS_AWARDED",
        description,
        metadata: {
          amount: safeAmount,
          source,
          referenceId: referenceId || null,
          balanceAfter: newBalance,
          awardedAt: new Date().toISOString(),
        },
      },
    });

    return {
      awarded: true,
      awardedAmount: safeAmount,
      gemsBalance: newBalance,
      source,
      description,
    };
  });

  // Dispatch real-time in-app notification if gems were awarded
  if (result.awarded) {
    try {
      const { createNotification } = await import("../../notifications/services/notification.service.js");
      await createNotification({
        userId,
        type: "ACHIEVEMENT",
        title: `Gems Earned (+${safeAmount} 💎)`,
        message: description,
        metadata: {
          amount: safeAmount,
          source,
          referenceId,
          newBalance: result.gemsBalance,
        },
      });
    } catch (err) {
      // Non-blocking
    }
  }

  return result;
}

/**
 * Retrieves paginated audit history of gem transactions for the user.
 */
export async function getGemHistory(
  userId: string,
  limit = 20,
  offset = 0
): Promise<{ transactions: GemTransactionItem[]; total: number }> {
  const safeLimit = Math.min(50, Math.max(1, limit));
  const safeOffset = Math.max(0, offset);

  const [rawTransactions, total] = await Promise.all([
    prisma.gemTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: safeLimit,
      skip: safeOffset,
    }),
    prisma.gemTransaction.count({
      where: { userId },
    }),
  ]);

  const transactions: GemTransactionItem[] = rawTransactions.map((tx) => ({
    id: tx.id,
    amount: tx.amount,
    source: tx.source,
    description: tx.description,
    referenceId: tx.referenceId,
    balanceAfter: tx.balanceAfter,
    createdAt: tx.createdAt.toISOString(),
  }));

  return { transactions, total };
}
