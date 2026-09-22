import prisma from "../../../../lib/prisma.js";
import { getCanonicalRoleDefinition } from "../../career-alignment/services/career-skills.map.js";

export type PaceCategory = "STEADY" | "RECOMMENDED" | "INTENSIVE" | "IMMERSIVE";

export interface PaceProjectionPoint {
  weeklyHours: number;
  weeksRemaining: number;
  monthsRemaining: number;
  completionDate: string; // ISO date string
  paceCategory: PaceCategory;
  paceLabel: string;
  intensityDescription: string;
}

export interface RoadmapSimulatorOutput {
  targetRole: string;
  weeklyAvailableHours: number;
  totalMilestones: number;
  completedMilestones: number;
  remainingMilestones: number;
  totalEstimatedHours: number;
  remainingEstimatedHours: number;
  currentPace: PaceProjectionPoint;
  projections: PaceProjectionPoint[];
  milestoneSummary: {
    id?: string;
    title: string;
    status: string;
    estimatedHours: number;
  }[];
}

/**
 * Extracts estimated hours from string descriptions like "2-3 weeks", "15 hours", etc.
 */
function parseEstimatedHours(timeStr?: string | null, fallbackHours = 20): number {
  if (!timeStr) return fallbackHours;
  const lower = timeStr.toLowerCase().trim();

  // e.g. "20 hours" or "15h"
  const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr|h)/);
  if (hourMatch && hourMatch[1]) {
    const hrs = parseFloat(hourMatch[1]);
    if (!isNaN(hrs) && hrs > 0) return hrs;
  }

  // e.g. "2-3 weeks" or "2 weeks" (assuming ~10-15 study hours per nominal milestone week)
  const weekMatch = lower.match(/(\d+)(?:\s*-\s*(\d+))?\s*(?:weeks|week|wks|wk|w)/);
  if (weekMatch && weekMatch[1]) {
    const minWk = parseFloat(weekMatch[1]);
    const maxWk = weekMatch[2] ? parseFloat(weekMatch[2]) : minWk;
    const avgWk = (minWk + maxWk) / 2;
    return Math.round(avgWk * 12); // standard 12 hrs per nominal roadmap week
  }

  // e.g. "3 days"
  const dayMatch = lower.match(/(\d+)\s*(?:days|day|d)/);
  if (dayMatch && dayMatch[1]) {
    return Math.max(4, Math.round(parseFloat(dayMatch[1]) * 2.5));
  }

  return fallbackHours;
}

function classifyPace(weeklyHours: number): {
  category: PaceCategory;
  label: string;
  description: string;
} {
  if (weeklyHours <= 6) {
    return {
      category: "STEADY",
      label: "Steady Pace 🌱",
      description: "Gentle, consistent learning alongside full-time work or school.",
    };
  }
  if (weeklyHours <= 14) {
    return {
      category: "RECOMMENDED",
      label: "Recommended Pace 🚀",
      description: "Balanced progress with optimal retention and project velocity.",
    };
  }
  if (weeklyHours <= 25) {
    return {
      category: "INTENSIVE",
      label: "Accelerated Sprint ⚡",
      description: "High-intensity commitment to become job-ready quickly.",
    };
  }
  return {
    category: "IMMERSIVE",
    label: "Full-Time Immersive 🏆",
    description: "Bootcamp-level daily immersive coding and portfolio building.",
  };
}

function calculateProjectionPoint(
  weeklyHours: number,
  remainingHours: number
): PaceProjectionPoint {
  const safeWeekly = Math.max(1, Math.min(60, weeklyHours));
  const safeHours = Math.max(1, remainingHours);

  const rawWeeks = safeHours / safeWeekly;
  const weeksRemaining = Math.max(1, Math.ceil(rawWeeks));
  const monthsRemaining = parseFloat((weeksRemaining / 4.33).toFixed(1));

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + weeksRemaining * 7);

  const paceInfo = classifyPace(safeWeekly);

  return {
    weeklyHours: safeWeekly,
    weeksRemaining,
    monthsRemaining,
    completionDate: targetDate.toISOString(),
    paceCategory: paceInfo.category,
    paceLabel: paceInfo.label,
    intensityDescription: paceInfo.description,
  };
}

/**
 * Calculates real-time roadmap simulation and velocity metrics for a learner.
 */
export async function getRoadmapSimulation(userId: string): Promise<RoadmapSimulatorOutput> {
  const [profile, activeRoadmap] = await Promise.all([
    prisma.careerProfile.findUnique({
      where: { userId },
      select: { targetRole: true, targetRoleName: true, weeklyAvailableHours: true },
    }),
    prisma.roadmap.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        milestones: {
          orderBy: { order: "asc" },
          select: { id: true, title: true, status: true, estimatedTime: true, order: true },
        },
      },
    }),
  ]);

  const targetRole =
    profile?.targetRoleName || profile?.targetRole || "Full Stack Developer";
  const weeklyHours = Math.max(3, profile?.weeklyAvailableHours || 10);

  let milestoneSummary: {
    id?: string;
    title: string;
    status: string;
    estimatedHours: number;
  }[] = [];

  if (activeRoadmap && activeRoadmap.milestones.length > 0) {
    milestoneSummary = activeRoadmap.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      status: m.status, // COMPLETED, CURRENT, UPCOMING
      estimatedHours: parseEstimatedHours(m.estimatedTime, 20),
    }));
  } else {
    // Brand new learner without generated roadmap yet: load canonical milestones
    const canonical = getCanonicalRoleDefinition(targetRole);
    milestoneSummary = canonical.milestones.map((m, idx) => ({
      title: m.title,
      status: idx === 0 ? "CURRENT" : "UPCOMING",
      estimatedHours: parseEstimatedHours(m.estimatedTime, 20),
    }));
  }

  const totalMilestones = milestoneSummary.length;
  const completedMilestones = milestoneSummary.filter(
    (m) => m.status === "COMPLETED" || m.status === "completed"
  ).length;
  const remainingMilestones = Math.max(0, totalMilestones - completedMilestones);

  const totalEstimatedHours = milestoneSummary.reduce(
    (acc, m) => acc + m.estimatedHours,
    0
  );
  const remainingEstimatedHours = milestoneSummary
    .filter((m) => m.status !== "COMPLETED" && m.status !== "completed")
    .reduce((acc, m) => acc + m.estimatedHours, 0);

  const effectiveRemainingHours =
    remainingEstimatedHours > 0
      ? remainingEstimatedHours
      : totalEstimatedHours > 0
      ? totalEstimatedHours
      : 120;

  const currentPace = calculateProjectionPoint(weeklyHours, effectiveRemainingHours);

  // Discrete benchmark projection values for comparison slider
  const projectionBenchmarkHours = [3, 5, 8, 12, 16, 20, 30, 40];
  const projections = projectionBenchmarkHours.map((h) =>
    calculateProjectionPoint(h, effectiveRemainingHours)
  );

  return {
    targetRole,
    weeklyAvailableHours: weeklyHours,
    totalMilestones,
    completedMilestones,
    remainingMilestones,
    totalEstimatedHours,
    remainingEstimatedHours: effectiveRemainingHours,
    currentPace,
    projections,
    milestoneSummary,
  };
}

/**
 * Updates learner's weekly available hours in CareerProfile and records activity log.
 */
export async function updateRoadmapPace(
  userId: string,
  newWeeklyHours: number
): Promise<RoadmapSimulatorOutput> {
  const boundedHours = Math.max(3, Math.min(50, Math.round(newWeeklyHours)));

  const currentProfile = await prisma.careerProfile.findUnique({
    where: { userId },
    select: { weeklyAvailableHours: true },
  });

  const previousHours = currentProfile?.weeklyAvailableHours || 10;

  // Persist updated weekly study pace
  await prisma.careerProfile.upsert({
    where: { userId },
    create: {
      userId,
      targetRole: "Full Stack Developer",
      targetRoleName: "Full Stack Developer",
      experienceLevel: "BEGINNER",
      weeklyAvailableHours: boundedHours,
    },
    update: {
      weeklyAvailableHours: boundedHours,
    },
  });

  // Log pace change activity
  await prisma.activityLog.create({
    data: {
      userId,
      type: "ROADMAP_PACE_UPDATED",
      description: `Adjusted weekly learning commitment from ${previousHours}h to ${boundedHours}h/week`,
      metadata: {
        previousHours,
        newHours: boundedHours,
        updatedAt: new Date().toISOString(),
      },
    },
  });

  const simulation = await getRoadmapSimulation(userId);

  // Dispatch in-app notification for pace change
  try {
    const { createNotification } = await import("../../notifications/services/notification.service.js");
    const targetDateFormatted = new Date(simulation.currentPace.completionDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    await createNotification({
      userId,
      type: "MILESTONE",
      title: "Target Study Pace Updated ⏱️",
      message: `Your weekly study commitment is set to ${boundedHours}h/week (${simulation.currentPace.paceLabel}). Estimated completion: ${targetDateFormatted} (~${simulation.currentPace.weeksRemaining} weeks).`,
      metadata: {
        previousHours,
        newHours: boundedHours,
        weeksRemaining: simulation.currentPace.weeksRemaining,
        completionDate: simulation.currentPace.completionDate,
      },
    });
  } catch (notifErr) {
    // Non-blocking notification dispatch
  }

  return simulation;
}
