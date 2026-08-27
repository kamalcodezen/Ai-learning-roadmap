import prisma from "../../../lib/prisma.js";

export const getSkillGaps = async (userId: string) => {
  const skillStates = await prisma.skillState.findMany({ 
    where: { userId },
    orderBy: { knowledgeScore: 'asc' },
  });

  const totalSkills = skillStates.length || 1;
  const overallHealth = Math.round(skillStates.reduce((a, s) => a + s.knowledgeScore, 0) / totalSkills);
  
  const criticalGaps = skillStates.filter(s => s.knowledgeScore < 40).length;
  const moderateGaps = skillStates.filter(s => s.knowledgeScore >= 40 && s.knowledgeScore < 70).length;
  const strongSkills = skillStates.filter(s => s.knowledgeScore >= 70).length;

  const gaps = skillStates.filter(s => s.knowledgeScore < 70).map(s => {
    const severity = s.knowledgeScore < 40 ? "critical" : "moderate";
    return {
      id: s.id,
      skill: s.skillName,
      score: Math.round(s.knowledgeScore),
      severity: severity,
      reason: severity === "critical" ? "Critical lack of theoretical knowledge." : "Needs more practice.",
      evidence: `Latest diagnostic score: ${Math.round(s.knowledgeScore)}%`,
      relatedAssessment: "Frontend Diagnostic Assessment",
      recommendedAction: `Start ${s.skillName} Module`,
      href: "/learning-path"
    };
  });

  return {
    overallHealth,
    criticalGaps,
    moderateGaps,
    strongSkills,
    gaps
  };
};
