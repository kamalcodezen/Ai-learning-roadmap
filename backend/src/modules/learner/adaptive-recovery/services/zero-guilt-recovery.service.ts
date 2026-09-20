import prisma from "../../../../lib/prisma.js";
import { awardXp } from "../../gamification/services/gamification.service.js";

export interface RecoveryStep {
  dayIndex: number; // 1, 2, 3, 4
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  type: "REFRESHER" | "PUZZLE" | "ROADMAP_STEP" | "MOMENTUM_BOOST";
  completed: boolean;
  completedAt?: string | null;
  content: {
    targetSkillOrConcept: string;
    description: string;
    details?: string[];
    puzzleQuestion?: string;
    puzzleOptions?: string[];
    puzzleCorrectIndex?: number;
    puzzleExplanation?: string;
    actionLabel: string;
    actionHref?: string;
  };
}

export interface ZeroGuiltRecoveryOutput {
  isRecoveryEligible: boolean;
  isRecoveryActive: boolean;
  isDismissed: boolean;
  isCompleted: boolean;
  daysInactive: number;
  lastActiveDate: string | null;
  welcomeMessage: {
    heading: string;
    subheading: string;
    encouragement: string;
  };
  targetMilestoneTitle: string;
  targetSkill: string;
  completedStepsCount: number;
  totalStepsCount: number;
  progressPercent: number;
  steps: RecoveryStep[];
}

/**
 * Returns dynamic conceptual questions / puzzles matching the target skill domain.
 */
function getCuratedPuzzleForSkill(skillName: string) {
  const norm = (skillName || "").toLowerCase();

  if (norm.includes("react") || norm.includes("frontend")) {
    return {
      puzzleQuestion: "In React, when does a component re-render under normal circumstances?",
      puzzleOptions: [
        "Only when the browser window is resized",
        "When its state changes, its parent re-renders, or its props change",
        "Every 1000 milliseconds automatically",
        "Only when an explicit DOM event listener is fired",
      ],
      puzzleCorrectIndex: 1,
      puzzleExplanation: "Correct! React triggers a re-render when local state changes, received props change, or the parent component re-renders.",
    };
  }

  if (norm.includes("node") || norm.includes("express") || norm.includes("backend") || norm.includes("api")) {
    return {
      puzzleQuestion: "What is the primary function of Express middleware functions (req, res, next)?",
      puzzleOptions: [
        "To compile TypeScript code into bytecode",
        "To render client-side HTML templates exclusively",
        "To execute code, modify request/response objects, and call the next middleware in line",
        "To manage database connection pools without pooling drivers",
      ],
      puzzleCorrectIndex: 2,
      puzzleExplanation: "Spot on! Middleware functions execute intermediate tasks (auth, logging, validation) before passing control via next().",
    };
  }

  if (norm.includes("sql") || norm.includes("database") || norm.includes("postgres")) {
    return {
      puzzleQuestion: "What is the main benefit of adding an INDEX on a frequently filtered column in PostgreSQL?",
      puzzleOptions: [
        "It prevents all duplicate rows automatically",
        "It drastically speeds up SELECT search queries from O(N) full-table scans to O(log N) tree lookups",
        "It compresses the database file to half size",
        "It encrypts the column data at rest",
      ],
      puzzleCorrectIndex: 1,
      puzzleExplanation: "Exactly! An index (typically B-tree) allows PostgreSQL to locate matching rows in logarithmic time instead of scanning every row.",
    };
  }

  // General programming & software architecture fallback
  return {
    puzzleQuestion: "Which HTTP status code signifies that a client request was successful and created a new resource?",
    puzzleOptions: [
      "200 OK",
      "201 Created",
      "204 No Content",
      "304 Not Modified",
    ],
    puzzleCorrectIndex: 1,
    puzzleExplanation: "Spot on! 201 Created informs the client that the request succeeded and a new resource has been created.",
  };
}

/**
 * Calculates inactivity and constructs the personalized 4-day Zero-Guilt Catch-Up plan.
 */
export async function getZeroGuiltRecoveryStatus(userId: string): Promise<ZeroGuiltRecoveryOutput> {
  const [lastActivity, userRecord, activeRoadmap, weakestSkillRecord, activePlanLog, completedStepLogs, dismissedLog] =
    await Promise.all([
      prisma.activityLog.findFirst({
        where: {
          userId,
          NOT: {
            type: { in: ["RECOVERY_PLAN_ACTIVE", "RECOVERY_STEP_COMPLETED", "RECOVERY_PLAN_DISMISSED"] },
          },
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, type: true, description: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true, updatedAt: true },
      }),
      prisma.roadmap.findFirst({
        where: { userId, status: "ACTIVE" },
        include: {
          milestones: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, status: true, description: true, unlocks: true },
          },
        },
      }),
      prisma.skillState.findFirst({
        where: { userId },
        orderBy: { knowledgeScore: "asc" },
        select: { skillName: true, knowledgeScore: true },
      }),
      prisma.activityLog.findFirst({
        where: { userId, type: "RECOVERY_PLAN_ACTIVE" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.activityLog.findMany({
        where: { userId, type: "RECOVERY_STEP_COMPLETED" },
        orderBy: { createdAt: "asc" },
      }),
      prisma.activityLog.findFirst({
        where: { userId, type: "RECOVERY_PLAN_DISMISSED" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  // 1. Calculate days inactive
  const lastActiveTimestamp = lastActivity?.createdAt || userRecord?.updatedAt || userRecord?.createdAt || new Date();
  const lastActiveDate = new Date(lastActiveTimestamp);
  const now = new Date();
  const diffTimeMs = Math.max(0, now.getTime() - lastActiveDate.getTime());
  const calculatedDaysInactive = Math.floor(diffTimeMs / (1000 * 60 * 60 * 24));

  // Check if simulated mode is recorded in active plan metadata
  const isSimulated = Boolean(activePlanLog?.metadata && (activePlanLog.metadata as any).isSimulated);
  const daysInactive = isSimulated ? Math.max(8, calculatedDaysInactive) : calculatedDaysInactive;

  // Inactivity threshold: 7 days
  const meetsInactivityThreshold = daysInactive >= 7;

  // Check dismissal within the last 7 days
  const isDismissedRecently = Boolean(
    dismissedLog && (now.getTime() - new Date(dismissedLog.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
  );

  // Active recovery criteria:
  // Eligible if inactive >= 7 days or manual simulation exists
  const isRecoveryEligible = (meetsInactivityThreshold || isSimulated) && !isDismissedRecently;

  // Active if plan started or eligible
  const isRecoveryActive = isRecoveryEligible || Boolean(activePlanLog && !isDismissedRecently);

  // 2. Identify current milestone and focus skill
  const currentMilestone =
    activeRoadmap?.milestones.find((m) => m.status === "CURRENT" || m.status === "current") ||
    activeRoadmap?.milestones.find((m) => m.status !== "COMPLETED" && m.status !== "completed") ||
    activeRoadmap?.milestones[0];

  const targetMilestoneTitle = currentMilestone?.title || "Core Architecture Foundations";
  const targetSkill = weakestSkillRecord?.skillName || currentMilestone?.unlocks?.[0] || "Foundational Problem Solving";

  // 3. Map completed steps from database activity logs
  const completedStepSet = new Map<number, string>();
  completedStepLogs.forEach((log) => {
    const meta = log.metadata as any;
    if (meta && typeof meta.dayIndex === "number") {
      completedStepSet.set(meta.dayIndex, log.createdAt.toISOString());
    }
  });

  const puzzleData = getCuratedPuzzleForSkill(targetSkill);

  // 4. Construct the 4-Day Micro Catch-Up Plan
  const steps: RecoveryStep[] = [
    {
      dayIndex: 1,
      title: "Day 1: 5-Minute Concept Refresher",
      subtitle: `Bite-sized recap of ${targetSkill} principles to reignite your mental models.`,
      estimatedMinutes: 5,
      type: "REFRESHER",
      completed: completedStepSet.has(1),
      completedAt: completedStepSet.get(1) || null,
      content: {
        targetSkillOrConcept: targetSkill,
        description: `Reviewing previous fundamentals restores working memory without the cognitive overload of massive chapters.`,
        details: [
          `Key principle: Break complex problems into atomic, testable modules.`,
          `High-yield concept: Understand state transitions and data flow in ${targetSkill}.`,
          `Confidence anchor: You've already conquered foundational concepts. A quick refresher locks them back in.`,
        ],
        actionLabel: "Complete Day 1 Review",
      },
    },
    {
      dayIndex: 2,
      title: "Day 2: 10-Minute Confidence Puzzle",
      subtitle: "One small, low-stress practical puzzle to revive problem-solving momentum.",
      estimatedMinutes: 10,
      type: "PUZZLE",
      completed: completedStepSet.has(2),
      completedAt: completedStepSet.get(2) || null,
      content: {
        targetSkillOrConcept: targetSkill,
        description: `Solving one tiny problem triggers dopamine release and removes fear of starting again.`,
        puzzleQuestion: puzzleData.puzzleQuestion,
        puzzleOptions: puzzleData.puzzleOptions,
        puzzleCorrectIndex: puzzleData.puzzleCorrectIndex,
        puzzleExplanation: puzzleData.puzzleExplanation,
        actionLabel: "Submit Solution",
      },
    },
    {
      dayIndex: 3,
      title: "Day 3: Resume Milestone Frontier",
      subtitle: `Unlock the next small step on "${targetMilestoneTitle}".`,
      estimatedMinutes: 15,
      type: "ROADMAP_STEP",
      completed: completedStepSet.has(3),
      completedAt: completedStepSet.get(3) || null,
      content: {
        targetSkillOrConcept: targetMilestoneTitle,
        description: `Your momentum is back! Review the current stage objectives and launch into the next project deliverable.`,
        actionLabel: "Launch Milestone Workspace",
        actionHref: `/dashboard/learner/learning-path?milestone=${encodeURIComponent(currentMilestone?.id || "")}`,
      },
    },
    {
      dayIndex: 4,
      title: "Day 4: Lock In Momentum (+50 XP & +3 💎 Bonus)",
      subtitle: "Claim your resilience achievement (+50 XP and +3 💎) and celebrate returning to your normal learning rhythm.",
      estimatedMinutes: 2,
      type: "MOMENTUM_BOOST",
      completed: completedStepSet.has(4),
      completedAt: completedStepSet.get(4) || null,
      content: {
        targetSkillOrConcept: "Resilience & Consistency",
        description: `Dropping off happens to every real engineer. Coming back and conquering recovery proves true career grit.`,
        actionLabel: "Claim +50 XP & +3 💎 Reward",
      },
    },
  ];

  const completedStepsCount = steps.filter((s) => s.completed).length;
  const totalStepsCount = steps.length;
  const progressPercent = Math.round((completedStepsCount / totalStepsCount) * 100);
  const isCompleted = completedStepsCount === totalStepsCount;

  return {
    isRecoveryEligible,
    isRecoveryActive: isRecoveryActive && !isCompleted,
    isDismissed: isDismissedRecently,
    isCompleted,
    daysInactive,
    lastActiveDate: lastActiveDate.toISOString(),
    welcomeMessage: {
      heading: "Welcome back! Life happens, and that's completely okay.",
      subheading: `You were away for ~${daysInactive} days. No penalties, no broken spirits. Let's restart your momentum smoothly.`,
      encouragement: "Research shows that 10-minute micro-tasks restart consistent habits 4x faster than attempting massive backlogs.",
    },
    targetMilestoneTitle,
    targetSkill,
    completedStepsCount,
    totalStepsCount,
    progressPercent,
    steps,
  };
}

/**
 * Activates or initializes the Zero-Guilt Recovery Plan.
 */
export async function activateZeroGuiltRecoveryPlan(
  userId: string,
  isManualSimulation = false
): Promise<ZeroGuiltRecoveryOutput> {
  // Clear any previous dismissal and prior simulated steps to allow fresh testing
  await prisma.activityLog.deleteMany({
    where: {
      userId,
      type: {
        in: isManualSimulation
          ? ["RECOVERY_PLAN_DISMISSED", "RECOVERY_STEP_COMPLETED"]
          : ["RECOVERY_PLAN_DISMISSED"],
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      userId,
      type: "RECOVERY_PLAN_ACTIVE",
      description: "Zero-Guilt Recovery Mode activated to safely rebuild learning momentum.",
      metadata: {
        activatedAt: new Date().toISOString(),
        isSimulated: isManualSimulation,
      },
    },
  });

  // Dispatch warm welcome notification
  try {
    const { createNotification } = await import("../../notifications/services/notification.service.js");
    await createNotification({
      userId,
      type: "SYSTEM",
      title: "Welcome Back! Zero-Guilt Mode Active 🌟",
      message: "No penalties, no broken streaks. Your 4-day Zero-Guilt Catch-Up plan is ready to help you rebuild momentum smoothly.",
      metadata: { activatedAt: new Date().toISOString() },
    });
  } catch (err) {
    // Non-blocking
  }

  return await getZeroGuiltRecoveryStatus(userId);
}

/**
 * Completes a specific day step of the recovery plan (1, 2, 3, or 4).
 * If Step 4 is completed, awards +50 XP to the user's gamification ledger.
 */
export async function completeZeroGuiltStep(
  userId: string,
  dayIndex: number,
  notes?: string
): Promise<ZeroGuiltRecoveryOutput> {
  const boundedDay = Math.max(1, Math.min(4, Math.round(dayIndex)));

  // Record step completion in ActivityLog
  await prisma.activityLog.create({
    data: {
      userId,
      type: "RECOVERY_STEP_COMPLETED",
      description: `Completed Zero-Guilt Catch-Up Day ${boundedDay}`,
      metadata: {
        dayIndex: boundedDay,
        completedAt: new Date().toISOString(),
        notes: notes || null,
      },
    },
  });

  // If Day 4 is completed, award 50 XP bonus idempotently and dispatch celebration notification
  if (boundedDay === 4) {
    try {
      await awardXp(
        userId,
        "ACHIEVEMENT_UNLOCKED",
        `RECOVERY_MOMENTUM_RESTORED_${new Date().getFullYear()}_${Math.floor(Date.now() / (7 * 86400000))}`,
        50,
        "Momentum Restored: Successfully completed Zero-Guilt Catch-Up Plan"
      );

      const { createNotification } = await import("../../notifications/services/notification.service.js");
      await createNotification({
        userId,
        type: "ACHIEVEMENT",
        title: "Momentum Restored (+50 XP) 🎉",
        message: "Congratulations! You completed the 4-day Zero-Guilt Catch-Up plan and earned a +50 XP resilience bonus!",
        metadata: {
          xpBonus: 50,
          completedAt: new Date().toISOString(),
        },
      });

      // Award +3 Gems resilience reward dynamically
      try {
        const { awardGems } = await import("../../gem-economy/services/gem-economy.service.js");
        await awardGems(
          userId,
          3,
          "RECOVERY_COMPLETED",
          "Resilience Restored: Successfully completed Zero-Guilt Catch-Up Plan (+3 💎)",
          `RECOVERY_GEMS_${new Date().getFullYear()}_${Math.floor(Date.now() / (7 * 86400000))}`
        );
      } catch (gemErr) {
        // Non-blocking
      }
    } catch (e) {
      // Non-blocking if already awarded
    }
  }

  return await getZeroGuiltRecoveryStatus(userId);
}

/**
 * Dismisses the recovery banner if learner chooses to jump straight back to roadmap.
 */
export async function dismissZeroGuiltRecovery(userId: string): Promise<{ success: boolean }> {
  await prisma.activityLog.create({
    data: {
      userId,
      type: "RECOVERY_PLAN_DISMISSED",
      description: "User elected to resume direct roadmap curriculum without recovery steps.",
      metadata: {
        dismissedAt: new Date().toISOString(),
      },
    },
  });

  return { success: true };
}
