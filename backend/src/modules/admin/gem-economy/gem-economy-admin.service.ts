import prisma from "../../../lib/prisma.js";

export interface GemEconomyOverviewStats {
  totalGemsInCirculation: number;
  totalTransactionsCount: number;
  claimsPast24h: number;
  activeStreakersCount: number;
  atRiskLearnersCount: number;
  totalLearnersCount: number;
}

export interface AdminGemTransactionItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userImage?: string | null;
  amount: number;
  source: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface AtRiskLearnerItem {
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  targetRole?: string | null;
  daysInactive: number;
  gemsBalance: number;
  lastActiveDate: string | null;
  isInRecovery: boolean;
}

/**
 * Returns platform-wide aggregate statistics on the AI Gem economy and streak status.
 * Optimized with database-level aggregations and distinct indexes for 100,000+ learners.
 */
export async function getGemEconomyOverview(): Promise<GemEconomyOverviewStats> {
  const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const past48h = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    circulationSum,
    totalTransactionsCount,
    claimsPast24h,
    totalLearnersCount,
    activeLearnersRes,
    activeStreakersRes,
  ] = await Promise.all([
    prisma.userGamification.aggregate({
      _sum: {
        gemsBalance: true,
      },
    }),
    prisma.gemTransaction.count(),
    prisma.gemTransaction.count({
      where: {
        source: "DAILY_STREAK",
        createdAt: { gte: past24h },
      },
    }),
    prisma.user.count({
      where: { role: "LEARNER" },
    }),
    prisma.$queryRaw<Array<{ count: bigint | number }>>`
      SELECT COUNT(DISTINCT "userId") AS count 
      FROM "ActivityLog" 
      WHERE "createdAt" >= ${sevenDaysAgo}
    `,
    prisma.$queryRaw<Array<{ count: bigint | number }>>`
      SELECT COUNT(DISTINCT "userId") AS count 
      FROM "GemTransaction" 
      WHERE "source" = 'DAILY_STREAK' AND "createdAt" >= ${past48h}
    `,
  ]);

  const activeLearnersCount = Number(activeLearnersRes[0]?.count ?? 0);
  const activeStreakersCount = Number(activeStreakersRes[0]?.count ?? 0);
  const atRiskLearnersCount = Math.max(0, totalLearnersCount - activeLearnersCount);

  return {
    totalGemsInCirculation: circulationSum._sum.gemsBalance || 0,
    totalTransactionsCount,
    claimsPast24h,
    activeStreakersCount,
    atRiskLearnersCount,
    totalLearnersCount,
  };
}

/**
 * Returns paginated live transaction records with user metadata.
 */
export async function getAdminGemTransactions(
  limit: number = 20,
  offset: number = 0,
  search?: string
): Promise<{ transactions: AdminGemTransactionItem[]; total: number }> {
  const where: any = {};

  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { description: { contains: search, mode: "insensitive" } },
      { source: { contains: search, mode: "insensitive" } },
    ];
  }

  const [rawTransactions, total] = await Promise.all([
    prisma.gemTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(50, Math.max(1, limit)),
      skip: Math.max(0, offset),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    }),
    prisma.gemTransaction.count({ where }),
  ]);

  const transactions: AdminGemTransactionItem[] = rawTransactions.map((t) => ({
    id: t.id,
    userId: t.userId,
    userName: t.user?.name || "Anonymous Learner",
    userEmail: t.user?.email || "",
    userImage: t.user?.image || null,
    amount: t.amount,
    source: t.source,
    description: t.description,
    balanceAfter: t.balanceAfter,
    createdAt: t.createdAt.toISOString(),
  }));

  return { transactions, total };
}

/**
 * Manually awards or adjusts gems for a specified learner with full audit log and notification.
 * Supports finding the learner by User ID or Email.
 */
export async function adjustUserGems(
  adminId: string,
  targetUserIdOrEmail: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newBalance: number; message: string }> {
  if (amount === 0) {
    throw new Error("Adjustment amount must not be zero.");
  }

  const query = targetUserIdOrEmail.trim();
  const targetUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: query },
        { email: { equals: query, mode: "insensitive" } },
      ],
    },
    include: { gamification: true },
  });

  if (!targetUser) {
    throw new Error("Target user not found.");
  }

  const realUserId = targetUser.id;
  const currentBalance = targetUser.gamification?.gemsBalance ?? 10;
  const newBalance = Math.max(0, currentBalance + amount);
  const isGrant = amount > 0;
  const description = reason.trim() || (isGrant ? `Admin Gem Bonus (+${amount} 💎)` : `Admin Gem Adjustment (${amount} 💎)`);

  await prisma.$transaction(async (tx) => {
    // 1. Upsert gamification record
    await tx.userGamification.upsert({
      where: { userId: realUserId },
      update: { gemsBalance: newBalance },
      create: {
        userId: realUserId,
        gemsBalance: newBalance,
        totalXp: 0,
        currentLevel: 1,
      },
    });

    // 2. Record gem transaction
    await tx.gemTransaction.create({
      data: {
        userId: realUserId,
        amount,
        source: "ADMIN_ADJUSTMENT",
        description,
        balanceAfter: newBalance,
      },
    });

    // 3. Log audit event
    await tx.adminAuditLog.create({
      data: {
        adminId,
        action: "GEM_ADJUSTMENT",
        targetId: realUserId,
        details: {
          targetUserEmail: targetUser.email,
          previousBalance: currentBalance,
          newBalance,
          amount,
          reason,
        },
      },
    });

    // 4. Send learner in-app notification
    await tx.notification.create({
      data: {
        userId: realUserId,
        type: isGrant ? "ACHIEVEMENT" : "SYSTEM",
        title: isGrant ? `Admin Bonus (+${amount} 💎)` : `Gem Wallet Adjustment (${amount} 💎)`,
        message: `${description}. Your new balance is ${newBalance} Gems.`,
        metadata: {
          amount,
          newBalance,
          adjustedByAdmin: true,
        },
      },
    });
  });

  return {
    success: true,
    newBalance,
    message: `Successfully adjusted ${amount > 0 ? `+${amount}` : amount} gems for ${targetUser.name || targetUser.email}. New balance: ${newBalance} 💎`,
  };
}

/**
 * Searches learners by name or email for quick selection in the gem award modal.
 * Optimized with indexes for instant search across 100,000+ learners.
 */
export async function searchLearnersForGems(query: string): Promise<Array<{
  id: string;
  name: string;
  email: string;
  image?: string | null;
  gemsBalance: number;
}>> {
  if (!query || query.trim().length < 1) return [];

  const trimmed = query.trim();
  const users = await prisma.user.findMany({
    where: {
      role: "LEARNER",
      OR: [
        { name: { contains: trimmed, mode: "insensitive" } },
        { email: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    take: 8,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      gamification: {
        select: { gemsBalance: true },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name || "Learner",
    email: u.email,
    image: u.image,
    gemsBalance: u.gamification?.gemsBalance ?? 10,
  }));
}

/**
 * Returns list of learners who haven't logged learning activity in >= 7 days.
 * Optimized with relational negative index filter for 100,000+ learners.
 */
export async function getAtRiskLearners(
  limit: number = 20,
  offset: number = 0,
  search?: string
): Promise<AtRiskLearnerItem[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const where: any = {
    role: "LEARNER",
    activityLogs: {
      none: {
        createdAt: { gte: sevenDaysAgo },
      },
    },
  };

  if (search && search.trim().length > 0) {
    const s = search.trim();
    where.AND = [
      {
        OR: [
          { name: { contains: s, mode: "insensitive" } },
          { email: { contains: s, mode: "insensitive" } },
        ],
      },
    ];
  }

  const learners = await prisma.user.findMany({
    where,
    take: Math.min(100, Math.max(1, limit)),
    skip: Math.max(0, offset),
    orderBy: { createdAt: "desc" },
    include: {
      careerProfile: {
        select: {
          targetRole: true,
          targetRoleName: true,
        },
      },
      gamification: {
        select: {
          gemsBalance: true,
        },
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          type: true,
          createdAt: true,
        },
      },
    },
  });

  return learners.map((l) => {
    const lastActiveDate = l.activityLogs[0]?.createdAt || l.createdAt;
    const diffMs = Date.now() - new Date(lastActiveDate).getTime();
    const daysInactive = Math.max(7, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const isInRecovery = l.activityLogs[0]?.type === "RECOVERY_PLAN_ACTIVE" || l.activityLogs[0]?.type === "RECOVERY_STEP_COMPLETED";

    return {
      userId: l.id,
      name: l.name || "Learner",
      email: l.email,
      image: l.image,
      targetRole: l.careerProfile?.targetRoleName || l.careerProfile?.targetRole || "Software Engineer",
      daysInactive,
      gemsBalance: l.gamification?.gemsBalance ?? 10,
      lastActiveDate: new Date(lastActiveDate).toISOString(),
      isInRecovery,
    };
  });
}

/**
 * Sends an encouraging recovery notification to a learner from the admin panel.
 */
export async function sendRecoveryReminder(
  adminId: string,
  targetUserId: string,
  customMessage?: string
): Promise<{ success: boolean; message: string }> {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    throw new Error("Target learner not found.");
  }

  const message =
    customMessage?.trim() ||
    `We miss you! Jump back into your learning journey with our Zero-Guilt 4-Day Catch-Up Plan. Earn bonus gems and keep your momentum alive!`;

  await prisma.notification.create({
    data: {
      userId: targetUserId,
      type: "SYSTEM",
      title: "We're cheering for your comeback! 🚀",
      message,
      metadata: {
        recoveryEncouragement: true,
        sentByAdminId: adminId,
      },
    },
  });

  return {
    success: true,
    message: `Recovery encouragement sent to ${targetUser.name || targetUser.email}!`,
  };
}
