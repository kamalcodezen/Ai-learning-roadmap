import prisma from "../../../../lib/prisma.js";
import { CAREER_SKILLS_MAP, FALLBACK_SKILLS } from "./career-skills.map.js";

export const getCareerAlignment = async (userId: string) => {
  // 1. Fetch user's career profile to get the real target role
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  const targetRole = profile?.targetRoleName || profile?.targetRole;

  if (!targetRole) {
    return {
      targetRole: "NO_TARGET_ROLE",
      matchPercentage: 0,
      strongSkills: [],
      developingSkills: [],
      missingSkills: [],
      criticalGaps: [],
      recommendations: ["Complete your onboarding to set a target career."],
      nextAction: "Complete Onboarding",
      href: "/onboarding"
    };
  }

  // 2. Lookup Required Skills for this role
  let requiredSkills = CAREER_SKILLS_MAP[targetRole];
  if (!requiredSkills) {
    requiredSkills = FALLBACK_SKILLS;
  }

  // 3. Fetch user's current skills
  const skillStates = await prisma.skillState.findMany({
    where: { userId },
  });

  const skillStateMap = new Map(skillStates.map(s => [s.skillName.toLowerCase(), s]));

  // 4. Calculate Match and Categorize Skills
  const strongSkills: string[] = [];
  const developingSkills: string[] = [];
  const missingSkills: string[] = [];
  const criticalGaps: string[] = [];
  const requirements: any[] = [];

  let totalScore = 0;
  let maxPossibleScore = 0;

  requiredSkills.forEach(req => {
    const weight = req.critical ? 2 : 1;
    maxPossibleScore += (100 * weight);

    const userSkill = skillStateMap.get(req.skill.toLowerCase());
    const score = userSkill ? userSkill.knowledgeScore : 0;
    
    totalScore += (score * weight);

    let status = "missing";
    if (score >= 70) {
      status = "acquired";
      strongSkills.push(req.skill);
    } else if (score > 0) {
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
      status: status
    });
  });

  const matchPercentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  // 5. Generate Recommendations and integrate with Roadmap
  const recommendations: string[] = [];
  
  if (criticalGaps.length > 0) {
    recommendations.push(`Focus immediately on your critical gaps: ${criticalGaps.join(", ")}.`);
  } else if (developingSkills.length > 0) {
    recommendations.push(`Keep practicing your developing skills: ${developingSkills.join(", ")}.`);
  } else if (strongSkills.length > 0) {
    recommendations.push(`Great job! You have strong alignment with the ${targetRole} role.`);
  }

  const activeRoadmap = await prisma.roadmap.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { milestones: true },
  });

  if (activeRoadmap) {
    const roadmapSkills = new Set<string>();
    activeRoadmap.milestones.forEach(m => m.unlocks.forEach(s => roadmapSkills.add(s.toLowerCase())));
    
    const missingRoadmapSkills = missingSkills.filter(s => roadmapSkills.has(s.toLowerCase()));
    if (missingRoadmapSkills.length > 0) {
      recommendations.push(`Continue your roadmap milestones to acquire: ${missingRoadmapSkills.join(", ")}.`);
    }
  }

  return {
    targetRole,
    matchPercentage,
    strongSkills,
    developingSkills,
    missingSkills,
    criticalGaps,
    requirements,
    recommendations: recommendations.length > 0 ? recommendations : ["Continue your learning path."],
    nextAction: "View Learning Path",
    href: "/dashboard/learner/learning-path"
  };
};
