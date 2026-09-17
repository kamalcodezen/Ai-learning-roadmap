import prisma from "../../../../lib/prisma.js";
import { getCareerReadiness } from "../../readiness/services/readiness.service.js";

export const getCareerTwin = async (userId: string, targetRoleOverride?: string) => {
  const [profile, activeRoadmap, readinessResult] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.roadmap.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { milestones: { orderBy: { order: "asc" } } },
    }),
    getCareerReadiness(userId, undefined, targetRoleOverride),
  ]);

  const targetRole =
    targetRoleOverride ||
    profile?.targetRoleName ||
    profile?.targetRole ||
    "Full Stack Developer";
  const experienceLevel = profile?.experienceLevel || "BEGINNER";

  const toNumeric = (val: number | string): number =>
    typeof val === "number" ? val : 0;

  const currentMilestone =
    activeRoadmap?.milestones.find((m) => m.status === "CURRENT") ||
    activeRoadmap?.milestones.find((m) => m.status === "UPCOMING") ||
    activeRoadmap?.milestones[0];

  const careerGaps = readinessResult.weakSkills.map((w) => {
    if (w.includes("(Needs Practice)")) {
      return `Lacks practical hands-on application in ${w.replace(" (Needs Practice)", "")}`;
    }
    return `Missing required core competency in ${w}`;
  });

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
      readinessResult.weakSkills.length > 0 && readinessResult.weakSkills[0]
        ? `Bridge gap in ${readinessResult.weakSkills[0].replace(" (Needs Practice)", "")}`
        : currentMilestone
          ? `Master ${currentMilestone.title}`
          : null,
    careerGaps,
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


