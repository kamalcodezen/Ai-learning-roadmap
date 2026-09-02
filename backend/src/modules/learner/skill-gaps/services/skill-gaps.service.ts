import prisma from "../../../../lib/prisma.js";
import { CAREER_SKILLS_MAP, FALLBACK_SKILLS } from "../../career-alignment/services/career-skills.map.js";

export const getSkillGaps = async (userId: string) => {
  const profile = await prisma.careerProfile.findUnique({ where: { userId } });
  const targetRole = profile?.targetRoleName || profile?.targetRole || "";

  const requiredSkills = targetRole && CAREER_SKILLS_MAP[targetRole] 
    ? CAREER_SKILLS_MAP[targetRole] 
    : FALLBACK_SKILLS;

  const skillStates = await prisma.skillState.findMany({ 
    where: { userId },
  });

  // Calculate overall health based only on tracked skills
  const totalSkills = skillStates.length || 1;
  const overallHealth = Math.round(skillStates.reduce((a, s) => a + s.knowledgeScore, 0) / totalSkills);
  
  // Find mapped skills
  const mappedSkillStates = requiredSkills.map(reqSkill => {
    const state = skillStates.find(s => s.skillName.toLowerCase() === reqSkill.skill.toLowerCase());
    return {
      skillName: reqSkill.skill,
      isCritical: reqSkill.critical,
      knowledgeScore: state ? state.knowledgeScore : 0,
      id: state ? state.id : null,
      isMissing: !state
    };
  });

  const criticalGaps = mappedSkillStates.filter(s => s.knowledgeScore < 40 && s.isCritical).length;
  const moderateGaps = mappedSkillStates.filter(s => s.knowledgeScore >= 40 && s.knowledgeScore < 70).length;
  const strongSkills = mappedSkillStates.filter(s => s.knowledgeScore >= 70).length;

  const gaps = mappedSkillStates.filter(s => s.knowledgeScore < 70).map((s, idx) => {
    const severity = s.knowledgeScore < 40 ? "critical" : "moderate";
    return {
      id: s.id || `missing-${idx}`,
      skill: s.skillName,
      score: Math.round(s.knowledgeScore),
      severity: severity,
      reason: s.isMissing ? "Not started yet." : severity === "critical" ? "Critical lack of theoretical knowledge." : "Needs more practice.",
      evidence: s.isMissing ? "No assessment taken." : `Latest knowledge score: ${Math.round(s.knowledgeScore)}%`,
      relatedAssessment: "Domain Assessment",
      recommendedAction: `Start ${s.skillName} Module`,
      href: "/dashboard/learner/learning-path"
    };
  }).sort((a, b) => a.severity === "critical" ? -1 : (b.severity === "critical" ? 1 : 0));

  return {
    overallHealth,
    criticalGaps,
    moderateGaps,
    strongSkills,
    gaps
  };
};
