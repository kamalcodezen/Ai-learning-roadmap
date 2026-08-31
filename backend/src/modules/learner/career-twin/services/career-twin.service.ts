import prisma from "../../../../lib/prisma.js";

export const getCareerTwin = async (userId: string) => {
  const profile = await prisma.careerProfile.findUnique({ where: { userId } });
  const skillStates = await prisma.skillState.findMany({ where: { userId } });
  
  const avgKnowledge = skillStates.length ? skillStates.reduce((a, s) => a + s.knowledgeScore, 0) / skillStates.length : 0;
  const avgPractice = skillStates.length ? skillStates.reduce((a, s) => a + s.practiceScore, 0) / skillStates.length : 0;
  const avgProject = skillStates.length ? skillStates.reduce((a, s) => a + s.projectScore, 0) / skillStates.length : 0;
  const avgEvidence = skillStates.length ? skillStates.reduce((a, s) => a + s.evidenceScore, 0) / skillStates.length : 0;

  const totalScore = Math.round((avgKnowledge + avgPractice + avgProject + avgEvidence) / 4) || 0;

  // Determine strong and weak skills based on knowledgeScore
  const strongSkills = skillStates.filter(s => s.knowledgeScore > 70).map(s => s.skillName).slice(0, 5);
  const weakSkills = skillStates.filter(s => s.knowledgeScore < 40).map(s => s.skillName).slice(0, 5);

  return {
    targetRole: profile?.targetRole || "Unknown Role",
    experienceLevel: profile?.experienceLevel || "Beginner",
    readinessScore: totalScore,
    scores: {
      knowledge: Math.round(avgKnowledge),
      practical: Math.round(avgPractice),
      projects: Math.round(avgProject),
      evidence: Math.round(avgEvidence),
      interview: 0,
    },
    strongSkills,
    weakSkills,
    currentFocus: weakSkills.length > 0 ? `Improve ${weakSkills[0]}` : null,
    careerGaps: weakSkills.length > 0 ? weakSkills.map(w => `Missing deep knowledge in ${w}`) : [],
    recommendedAction: profile ? {
      title: "Continue Learning",
      description: "Keep working on your roadmap to improve your readiness.",
      actionLabel: "View Roadmap",
      href: "/learning-path"
    } : null
  };
};

