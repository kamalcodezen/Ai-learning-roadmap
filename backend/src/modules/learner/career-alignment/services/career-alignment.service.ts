import prisma from "../../../../lib/prisma.js";

export const getCareerAlignment = async (userId: string) => {
  // 1. Fetch user's career profile to get the real target role
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });
  const targetRole = profile?.targetRoleName || profile?.targetRole || "Unknown Role";

  // 2. Fetch user's current skills
  const skillStates = await prisma.skillState.findMany({
    where: { userId },
  });

  // 3. Calculate a real fit score based on existing skill knowledge
  // If the user has no skills yet, we return 0 rather than inventing a fake score.
  let currentFit = 0;
  if (skillStates.length > 0) {
    const totalKnowledge = skillStates.reduce((acc, s) => acc + s.knowledgeScore, 0);
    currentFit = Math.round(totalKnowledge / skillStates.length);
  }

  // 4. Identify strong skills and priority gaps based on real scores
  const strongSkills = skillStates
    .filter(s => s.knowledgeScore >= 70)
    .sort((a, b) => b.knowledgeScore - a.knowledgeScore)
    .map(s => s.skillName);

  const priorityGaps = skillStates
    .filter(s => s.knowledgeScore < 50)
    .sort((a, b) => a.knowledgeScore - b.knowledgeScore)
    .map(s => s.skillName);

  // 5. Determine missing skills from Roadmap if it exists
  // We check the unlocks array on the milestones to find required skills.
  const activeRoadmap = await prisma.roadmap.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { milestones: true },
  });

  const missingSkills: string[] = [];
  if (activeRoadmap) {
    // Collect all skills the roadmap intends to teach
    const roadmapSkills = new Set<string>();
    activeRoadmap.milestones.forEach(m => {
      m.unlocks.forEach(skill => roadmapSkills.add(skill));
    });

    // Check which ones the user hasn't started learning
    const knownSkillNames = new Set(skillStates.map(s => s.skillName));
    roadmapSkills.forEach(skill => {
      if (!knownSkillNames.has(skill)) {
        missingSkills.push(skill);
      }
    });
  }

    // 6. Generate requirements array based on actual data
    const requirements = skillStates.map(s => ({
      skill: s.skillName,
      importance: s.knowledgeScore > 70 ? "High" : s.knowledgeScore > 40 ? "Medium" : "Low",
      status: s.knowledgeScore > 70 ? "acquired" : s.knowledgeScore > 40 ? "learning" : "missing"
    }));
    
    // Fallback if empty
    if (requirements.length === 0) {
      requirements.push({
        skill: "Core Fundamentals",
        importance: "High",
        status: "missing"
      });
    }

    return {
      targetRole,
      matchPercentage: currentFit,
      strongSkills: strongSkills.length > 0 ? strongSkills : ["No strong skills yet"],
      missingSkills: priorityGaps.length > 0 ? priorityGaps : ["No critical gaps"],
      requirements: requirements,
      recommendations: [
        "Continue practicing to increase your match percentage.",
        "Focus on your priority gaps first."
      ],
      nextAction: "View Learning Path",
      href: "/learning-path"
    };
  };
