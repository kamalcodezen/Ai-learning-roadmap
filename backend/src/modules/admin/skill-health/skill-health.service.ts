import prisma from "../../../lib/prisma.js";

export const getAdminSkillHealth = async () => {
  const skills = await prisma.skillState.findMany({
    select: { skillName: true, knowledgeScore: true, practiceScore: true, projectScore: true, evidenceScore: true },
  });
  
  const skillAgg = new Map<string, { count: number, total: number }>();
  skills.forEach((s: any) => {
    const avg = (s.knowledgeScore + s.practiceScore + s.projectScore + s.evidenceScore) / 4;
    const existing = skillAgg.get(s.skillName) || { count: 0, total: 0 };
    skillAgg.set(s.skillName, { count: existing.count + 1, total: existing.total + avg });
  });

  const result = Array.from(skillAgg.entries()).map(([name, data]) => ({
    name,
    averageScore: Math.round(data.total / data.count),
    usersCount: data.count
  })).sort((a: any, b: any) => b.averageScore - a.averageScore);

  const strongSkills = result.filter(s => s.averageScore >= 75);
  const weakSkills = result.filter(s => s.averageScore < 50);

  return { allSkills: result, strongSkills, weakSkills };
};
