import prisma from "../../../../lib/prisma.js";
import { getCareerReadiness } from "../../readiness/services/readiness.service.js";

export const getCareerTwin = async (userId: string) => {
  const profile = await prisma.careerProfile.findUnique({ where: { userId } });
  
  // Use the single source of truth for Readiness Scoring
  const readinessResult = await getCareerReadiness(userId);

  return {
    targetRole: profile?.targetRole || "Unknown Role",
    experienceLevel: profile?.experienceLevel || "Beginner",
    readinessScore: readinessResult.score,
    scores: {
      knowledge: readinessResult.scores.knowledge,
      practical: readinessResult.scores.practical,
      projects: readinessResult.scores.projects,
      evidence: readinessResult.scores.evidence,
      communication: readinessResult.scores.communication,
      interview: readinessResult.scores.interview,
    },
    communicationEvaluation: readinessResult.communicationEvaluation,
    strongSkills: readinessResult.strongSkills,
    weakSkills: readinessResult.weakSkills,
    currentFocus: readinessResult.weakSkills.length > 0 ? `Improve ${readinessResult.weakSkills[0]}` : null,
    careerGaps: readinessResult.weakSkills.length > 0 ? readinessResult.weakSkills.map(w => `Missing deep knowledge in ${w}`) : [],
    recommendedAction: profile ? {
      title: "Continue Learning",
      description: "Keep working on your roadmap to improve your readiness.",
      actionLabel: "View Roadmap",
      href: "/dashboard/learner/learning-path"
    } : null
  };
};

