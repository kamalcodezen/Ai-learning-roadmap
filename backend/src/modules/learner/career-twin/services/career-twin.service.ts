import prisma from "../../../../lib/prisma.js";
import { getCareerReadiness } from "../../readiness/services/readiness.service.js";

export const getCareerTwin = async (userId: string) => {
  const [profile, activeRoadmap, readinessResult] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.roadmap.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { milestones: { orderBy: { order: "asc" } } },
    }),
    getCareerReadiness(userId),
  ]);

  const targetRole =
    profile?.targetRoleName || profile?.targetRole || "Unknown Role";
  const experienceLevel = profile?.experienceLevel || "Beginner";

  const toNumeric = (val: number | string): number =>
    typeof val === "number" ? val : 0;

  const currentMilestone =
    activeRoadmap?.milestones.find((m) => m.status === "CURRENT") ||
    activeRoadmap?.milestones.find((m) => m.status === "UPCOMING") ||
    activeRoadmap?.milestones[0];

  return {
    targetRole,
    experienceLevel,
    readinessScore: readinessResult.score,
    scores: {
      knowledge: toNumeric(readinessResult.scores.knowledge),
      practical: toNumeric(readinessResult.scores.practical),
      projects: toNumeric(readinessResult.scores.projects),
      evidence: toNumeric(readinessResult.scores.evidence),
      communication: toNumeric(readinessResult.scores.communication),
      interview: toNumeric(readinessResult.scores.interview),
    },
    communicationEvaluation: readinessResult.communicationEvaluation,
    strongSkills: readinessResult.strongSkills,
    weakSkills: readinessResult.weakSkills,
    currentFocus:
      readinessResult.weakSkills.length > 0
        ? `Improve ${readinessResult.weakSkills[0]}`
        : currentMilestone
          ? `Master ${currentMilestone.title}`
          : null,
    careerGaps:
      readinessResult.weakSkills.length > 0
        ? readinessResult.weakSkills.map((w) => `Missing deep knowledge in ${w}`)
        : [],
    recommendedAction: currentMilestone
      ? {
          title: currentMilestone.title,
          description:
            currentMilestone.description ||
            "Continue your current learning milestone to increase your readiness.",
          actionLabel: "View Learning Path",
          href: "/dashboard/learner/learning-path",
        }
      : profile
        ? {
            title: "Continue Learning",
            description:
              "Keep working on your roadmap to improve your career readiness.",
            actionLabel: "View Roadmap",
            href: "/dashboard/learner/learning-path",
          }
        : null,
  };
};

