import prisma from "../../../../lib/prisma.js";
import { getRequiredSkillsForRole } from "../../career-alignment/services/career-skills.map.js";
import { isMatchingSkill } from "../../assessments/services/skill-simulation.service.js";

export const getSkillGaps = async (userId: string) => {
  const profile = await prisma.careerProfile.findUnique({ where: { userId } });
  const targetRole = profile?.targetRoleName || profile?.targetRole || "";

  // 1. Fetch canonical required skills using normalized role matcher
  const requiredSkills = getRequiredSkillsForRole(targetRole);

  // Fetch skill states and active roadmap concurrently
  const [skillStates, activeRoadmap] = await Promise.all([
    prisma.skillState.findMany({ where: { userId } }),
    prisma.roadmap.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        milestones: {
          orderBy: { order: "asc" },
          select: { id: true, title: true, unlocks: true, status: true },
        },
      },
    }),
  ]);

  // Calculate overall health based on tracked skills or 0 if none tracked yet
  const overallHealth = skillStates.length > 0
    ? Math.round(skillStates.reduce((a, s) => a + s.knowledgeScore, 0) / skillStates.length)
    : 0;
  
  // Extract career analysis context only if cached and role matches current target role
  const aiAnalysis = profile?.aiAnalysis as any;
  const analysisRoleNorm = aiAnalysis?.role ? String(aiAnalysis.role).trim().toLowerCase() : "";
  const targetRoleNorm = targetRole ? String(targetRole).trim().toLowerCase() : "";
  const isAnalysisValid = aiAnalysis && (
    analysisRoleNorm === targetRoleNorm || 
    aiAnalysis.role === profile?.targetRoleName || 
    aiAnalysis.role === profile?.targetRole
  );

  const analysisCoreSkills: Array<{ name: string; reason: string }> = isAnalysisValid && Array.isArray(aiAnalysis?.coreSkills)
    ? aiAnalysis.coreSkills
    : [];
  const analysisSupportingSkills: Array<{ name: string; reason: string }> = isAnalysisValid && Array.isArray(aiAnalysis?.supportingSkills)
    ? aiAnalysis.supportingSkills
    : [];
  const allAnalysisSkills = [...analysisCoreSkills, ...analysisSupportingSkills];

  // Find mapped skills
  const mappedSkillStates = requiredSkills.map(reqSkill => {
    const state = skillStates.find(s => isMatchingSkill(s.skillName, reqSkill.skill));
    const score = state ? state.knowledgeScore : 0;
    const aiSkillMatch = allAnalysisSkills.find(
      as => isMatchingSkill(as.name, reqSkill.skill)
    );

    return {
      skillName: reqSkill.skill,
      isCritical: reqSkill.critical,
      knowledgeScore: score,
      id: state ? state.id : null,
      isMissing: !state,
      aiReason: aiSkillMatch?.reason || null
    };
  });

  const criticalGaps = mappedSkillStates.filter(s => s.knowledgeScore < 40 && s.isCritical).length;
  const moderateGaps = mappedSkillStates.filter(s => s.knowledgeScore >= 40 && s.knowledgeScore < 70).length;
  const strongSkills = mappedSkillStates.filter(s => s.knowledgeScore >= 70).length;

  const gaps = mappedSkillStates.filter(s => s.knowledgeScore < 70).map((s, idx) => {
    const severity: "critical" | "moderate" = (s.knowledgeScore < 40 || s.isCritical) && s.knowledgeScore < 40 
      ? "critical" 
      : "moderate";

    let reason = s.aiReason;
    if (!reason) {
      if (s.isMissing) {
        reason = "Skill has not been assessed or verified yet.";
      } else if (severity === "critical") {
        reason = "Proficiency is below the minimum threshold required for this role.";
      } else {
        reason = "Foundational proficiency demonstrated, but requires additional practice/project evidence.";
      }
    }

    const evidence = s.isMissing 
      ? "No assessment or project evidence recorded." 
      : `Current verified proficiency: ${Math.round(s.knowledgeScore)}%`;

    // Match skill against active roadmap milestone unlocks (flexible normalized matcher)
    const normSkill = s.skillName.toLowerCase().trim();
    const matchingMilestone = activeRoadmap?.milestones.find((m) =>
      (m.unlocks || []).some((u: string) => {
        const normU = u.toLowerCase().trim();
        return (
          normU === normSkill ||
          normSkill.includes(normU) ||
          normU.includes(normSkill)
        );
      })
    );

    const href = matchingMilestone
      ? `/dashboard/learner/learning-path?skill=${encodeURIComponent(s.skillName)}&milestone=${encodeURIComponent(matchingMilestone.id)}`
      : "/dashboard/learner/learning-path";

    return {
      id: s.id || `missing-${idx}`,
      skill: s.skillName,
      score: Math.round(s.knowledgeScore),
      severity,
      reason,
      evidence,
      relatedAssessment: "Domain Assessment & Diagnostic",
      recommendedAction: `Start ${s.skillName} Learning Path`,
      href
    };
  }).sort((a, b) => (a.severity === "critical" ? -1 : b.severity === "critical" ? 1 : 0));

  return {
    overallHealth,
    criticalGaps,
    moderateGaps,
    strongSkills,
    gaps
  };
};
