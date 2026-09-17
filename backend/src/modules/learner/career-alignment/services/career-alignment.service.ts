import prisma from "../../../../lib/prisma.js";
import { getRequiredSkillsForRole, getCanonicalRoleDefinition } from "./career-skills.map.js";
import { isMatchingSkill } from "../../assessments/services/skill-simulation.service.js";

export const getCareerAlignment = async (userId: string) => {
  // 1. Fetch user's profile, skills, roadmap, and projects concurrently
  const [profile, skillStates, roadmaps, projects] = await Promise.all([
    prisma.careerProfile.findUnique({
      where: { userId },
    }),
    prisma.skillState.findMany({
      where: { userId },
    }),
    prisma.roadmap.findMany({
      where: { userId },
      include: {
        milestones: {
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.project.findMany({
      where: { userId },
    }),
  ]);

  const targetRole = profile?.targetRoleName || profile?.targetRole;

  if (!targetRole) {
    return {
      targetRole: "NO_TARGET_ROLE",
      matchPercentage: 0,
      seniorityBenchmarks: {
        junior: 0,
        mid: 0,
        senior: 0,
      },
      strongSkills: [],
      developingSkills: [],
      missingSkills: [],
      criticalGaps: [],
      requirements: [],
      recommendations: ["Complete your onboarding to set a target career."],
      nextAction: "Complete Onboarding",
      href: "/onboarding",
    };
  }

  // 2. Lookup Required Skills for this role (canonical or dynamic)
  const roleDef = getCanonicalRoleDefinition(targetRole);
  const requiredSkills = getRequiredSkillsForRole(targetRole);

  const activeRoadmap = roadmaps.find((r) => r.status === "ACTIVE") || roadmaps[0];
  const completedMilestones = activeRoadmap?.milestones.filter((m) => m.status === "COMPLETED") || [];

  // Collect skills verified through completed milestones and projects
  const completedMilestoneSkills = new Set<string>();
  completedMilestones.forEach((m) => {
    (m.unlocks || []).forEach((u) => completedMilestoneSkills.add(u.toLowerCase()));
  });

  const projectTechSkills = new Set<string>();
  projects.forEach((p) => {
    (p.techStack || []).forEach((t) => projectTechSkills.add(t.toLowerCase()));
  });

  // 3. Calculate Match and Categorize Skills
  const strongSkills: string[] = [];
  const developingSkills: string[] = [];
  const missingSkills: string[] = [];
  const criticalGaps: string[] = [];
  const requirements: Array<{
    skill: string;
    importance: "High" | "Medium" | "Low";
    status: "acquired" | "learning" | "missing";
    score: number;
    knowledgeScore: number;
    practiceScore: number;
    projectScore: number;
    evidenceScore: number;
  }> = [];

  let totalWeightedScore = 0;
  let maxPossibleScore = 0;

  requiredSkills.forEach((req) => {
    const weight = req.critical ? 2 : 1;
    maxPossibleScore += 100 * weight;

    // Look for matching skill in skillStates
    const userSkill = skillStates.find((s) => isMatchingSkill(s.skillName, req.skill));

    let kScore = userSkill ? userSkill.knowledgeScore : 0;
    let pScore = userSkill ? userSkill.practiceScore : 0;
    let projScore = userSkill ? userSkill.projectScore : 0;
    let evScore = userSkill ? userSkill.evidenceScore : 0;

    // Credit completed milestones or projects if not already reflected
    const isCoveredInCompletedMilestone = Array.from(completedMilestoneSkills).some((ms) =>
      isMatchingSkill(ms, req.skill)
    );
    if (isCoveredInCompletedMilestone) {
      if (kScore === 0) kScore = 65;
      if (pScore === 0) pScore = 60;
    }

    const isCoveredInProject = Array.from(projectTechSkills).some((ps) =>
      isMatchingSkill(ps, req.skill)
    );
    if (isCoveredInProject) {
      if (projScore === 0) projScore = 70;
      if (evScore === 0) evScore = 65;
    }

    let compositeScore = 0;
    if (userSkill || isCoveredInCompletedMilestone || isCoveredInProject) {
      if (projScore > 0 && pScore > 0) {
        compositeScore = Math.round(kScore * 0.4 + pScore * 0.3 + projScore * 0.3);
      } else if (pScore > 0) {
        // Active practical verification with theoretical foundation
        compositeScore = Math.round(kScore * 0.55 + pScore * 0.45);
      } else if (projScore > 0) {
        // Active project evidence with theoretical foundation
        compositeScore = Math.round(kScore * 0.6 + projScore * 0.4);
      } else {
        // Pure theoretical knowledge without verified code practice or portfolio project yet.
        // Cap at 65% so it properly sits in Developing until practical verification is submitted.
        compositeScore = Math.min(65, Math.round(kScore * 0.65));
      }
    }

    totalWeightedScore += compositeScore * weight;

    let status: "acquired" | "learning" | "missing" = "missing";
    if (compositeScore >= 70) {
      status = "acquired";
      strongSkills.push(req.skill);
    } else if (compositeScore > 0) {
      status = "learning";
      developingSkills.push(req.skill);
    } else {
      missingSkills.push(req.skill);
      if (req.critical) {
        criticalGaps.push(req.skill);
      }
    }

    requirements.push({
      skill: req.skill,
      importance: req.critical ? "High" : "Medium",
      status,
      score: compositeScore,
      knowledgeScore: Math.round(kScore),
      practiceScore: Math.round(pScore),
      projectScore: Math.round(projScore),
      evidenceScore: Math.round(evScore),
    });
  });

  const matchPercentage =
    maxPossibleScore > 0 ? Math.round((totalWeightedScore / maxPossibleScore) * 100) : 0;

  const juniorBenchmark = Math.min(100, Math.round(matchPercentage * 1.15));
  const midBenchmark = matchPercentage;
  const seniorBenchmark = Math.round(matchPercentage * 0.85);

  // 4. Generate Strategic Recommendations
  const recommendations: string[] = [];

  if (criticalGaps.length > 0) {
    recommendations.push(
      `Focus immediately on your critical role gaps: ${criticalGaps.slice(0, 3).join(", ")}${criticalGaps.length > 3 ? "..." : ""}.`
    );
  }

  if (developingSkills.length > 0) {
    recommendations.push(
      `Solidify your developing skills (${developingSkills.slice(0, 3).join(", ")}) through interactive simulations and practical code projects.`
    );
  }

  if (activeRoadmap) {
    const upcomingMilestones = activeRoadmap.milestones.filter((m) => m.status !== "COMPLETED");
    const nextMilestone = upcomingMilestones[0];
    if (nextMilestone) {
      recommendations.push(
        `Next Recommended Action: Complete milestone "${nextMilestone.title}" to unlock core skills for ${targetRole}.`
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(
      `Outstanding progress! You have achieved exceptional alignment with the ${targetRole} curriculum.`
    );
  }

  const defaultSeniority: "junior" | "mid" | "senior" =
    profile?.experienceLevel === "BEGINNER" ? "junior" : "mid";

  return {
    targetRole,
    roleDescription: roleDef.description,
    matchPercentage,
    experienceLevel: profile?.experienceLevel || "BEGINNER",
    defaultSeniority,
    seniorityBenchmarks: {
      junior: juniorBenchmark,
      mid: midBenchmark,
      senior: seniorBenchmark,
    },
    strongSkills,
    developingSkills,
    missingSkills,
    criticalGaps,
    requirements,
    recommendations,
    nextAction: "View Learning Path",
    href: "/dashboard/learner/learning-path",
  };
};
