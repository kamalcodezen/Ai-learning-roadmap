import prisma from "../../../../lib/prisma.js";
import { getRequiredSkillsForRole, getCanonicalRoleDefinition } from "../../career-alignment/services/career-skills.map.js";
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
  // Find mapped skills
  // If multiple skillStates match a required skill, pick the highest verified knowledge score
  const mappedSkillStates = requiredSkills.map(reqSkill => {
    const matchingStates = skillStates.filter(s => isMatchingSkill(s.skillName, reqSkill.skill));
    const maxScore = matchingStates.length > 0
      ? Math.max(...matchingStates.map(s => s.knowledgeScore))
      : 0;
    const state = matchingStates.find(s => s.knowledgeScore === maxScore) || matchingStates[0];
    const aiSkillMatch = allAnalysisSkills.find(
      as => isMatchingSkill(as.name, reqSkill.skill)
    );

    return {
      skillName: reqSkill.skill,
      isCritical: reqSkill.critical,
      knowledgeScore: maxScore,
      id: state ? state.id : null,
      isMissing: !state,
      aiReason: aiSkillMatch?.reason || null
    };
  });

  // Include any assessed learner skills from skillStates not already covered by requiredSkills
  const unmappedStates = skillStates.filter(
    s => !requiredSkills.some(req => isMatchingSkill(s.skillName, req.skill))
  );

  // Deduplicate unmapped states if any aliases exist, keeping highest verified score
  const seenUnmapped = new Set<string>();
  for (const extraState of unmappedStates) {
    const isAlreadyCovered = Array.from(seenUnmapped).some(seen => isMatchingSkill(seen, extraState.skillName));
    if (isAlreadyCovered) continue;
    seenUnmapped.add(extraState.skillName);

    const allMatching = skillStates.filter(s => isMatchingSkill(s.skillName, extraState.skillName));
    const bestScore = Math.max(...allMatching.map(s => s.knowledgeScore));
    const bestState = allMatching.find(s => s.knowledgeScore === bestScore) || extraState;

    const aiSkillMatch = allAnalysisSkills.find(
      as => isMatchingSkill(as.name, extraState.skillName)
    );

    mappedSkillStates.push({
      skillName: extraState.skillName,
      isCritical: bestScore < 40,
      knowledgeScore: bestScore,
      id: bestState.id,
      isMissing: false,
      aiReason: aiSkillMatch?.reason || null
    });
  }

  // Reconcile completed milestones: if a milestone on an active roadmap is COMPLETED,
  // ensure its covered skills reflect at least 75% verified proficiency
  if (activeRoadmap?.milestones) {
    const completedMilestones = activeRoadmap.milestones.filter(m => m.status === "COMPLETED");
    for (const cm of completedMilestones) {
      const covered = cm.unlocks || [];
      for (const cov of covered) {
        const existing = mappedSkillStates.find(ms => isMatchingSkill(ms.skillName, cov));
        if (existing && existing.knowledgeScore < 75) {
          existing.knowledgeScore = 75;
          existing.isMissing = false;
        }
      }
    }
  }

  const criticalGaps = mappedSkillStates.filter(s => s.knowledgeScore < 40 && s.isCritical).length;
  const moderateGaps = mappedSkillStates.filter(s => s.knowledgeScore >= 40 && s.knowledgeScore < 70).length;
  const strongSkills = mappedSkillStates.filter(s => s.knowledgeScore >= 70).length;

  // Deduplicate gaps by canonical skillName and ensure globally unique IDs
  const seenGapSkills = new Set<string>();
  const deduplicatedGaps = [];

  for (let idx = 0; idx < mappedSkillStates.length; idx++) {
    const s = mappedSkillStates[idx];
    if (!s || s.knowledgeScore >= 70) continue;

    const normSkill = s.skillName.trim().toLowerCase();
    if (seenGapSkills.has(normSkill)) continue;
    seenGapSkills.add(normSkill);

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

    const canonicalRole = getCanonicalRoleDefinition(targetRole);

    // 1. Direct match against active roadmap milestone unlocks or title
    let matchingMilestone = activeRoadmap?.milestones.find((m) =>
      (m.unlocks || []).some((u: string) => isMatchingSkill(u, s.skillName)) ||
      isMatchingSkill(m.title, s.skillName)
    );

    // 2. If not matched directly, match via canonical role blueprint
    if (!matchingMilestone && activeRoadmap?.milestones && activeRoadmap.milestones.length > 0) {
      const canonicalIdx = canonicalRole.milestones.findIndex((cm) =>
        (cm.skillsCovered || []).some((u) => isMatchingSkill(u, s.skillName)) ||
        (cm.technologies || []).some((t) => isMatchingSkill(t, s.skillName)) ||
        isMatchingSkill(cm.title, s.skillName) ||
        cm.description.toLowerCase().includes(normSkill) ||
        normSkill.includes(cm.title.toLowerCase())
      );
      if (canonicalIdx !== -1 && activeRoadmap.milestones[canonicalIdx]) {
        matchingMilestone = activeRoadmap.milestones[canonicalIdx];
      }
    }

    // 3. Fallback for fundamental / web / tooling skills (e.g. Live Server, HTTP, Git, HTML, DOM)
    if (!matchingMilestone && activeRoadmap?.milestones && activeRoadmap.milestones.length > 0) {
      const isFoundational = /live server|http|syntax|basics|git|html|css|terminal|editor|web fundamentals/i.test(normSkill);
      if (isFoundational) {
        matchingMilestone = activeRoadmap.milestones[0];
      } else {
        matchingMilestone = activeRoadmap.milestones.find((m) => m.status === "CURRENT") || activeRoadmap.milestones[0];
      }
    }

    const targetMilestone = matchingMilestone || activeRoadmap?.milestones[0];
    const isTargetLocked = targetMilestone && targetMilestone.status === "UPCOMING";
    const isTargetCompleted = targetMilestone && targetMilestone.status === "COMPLETED";
    const activeFrontier = activeRoadmap?.milestones.find((m) => m.status === "CURRENT") || activeRoadmap?.milestones[0];

    const simulationHref = `/dashboard/learner/assessments/simulation?skill=${encodeURIComponent(s.skillName)}`;

    const recommendedAction = targetMilestone
      ? isTargetCompleted
        ? `Verify proficiency via Skill Simulation`
        : isTargetLocked
          ? `Unlock via ${activeFrontier?.title || "Stage 1"}`
          : `Master in ${targetMilestone.title}`
      : `Verify via Skill Simulation`;

    const learningPathHref = targetMilestone
      ? `/dashboard/learner/learning-path?skill=${encodeURIComponent(s.skillName)}&milestone=${encodeURIComponent(targetMilestone.id)}&source=fix-gap`
      : `/dashboard/learner/learning-path?skill=${encodeURIComponent(s.skillName)}&source=fix-gap`;

    const href = isTargetCompleted ? simulationHref : learningPathHref;

    const slug = normSkill.replace(/[^a-z0-9]/g, "-");
    deduplicatedGaps.push({
      id: s.id ? `${s.id}-${slug}` : `missing-${slug}-${idx}`,
      skill: s.skillName,
      score: Math.round(s.knowledgeScore),
      severity,
      reason,
      evidence,
      relatedAssessment: "Domain Assessment & Diagnostic",
      recommendedAction,
      href,
      simulationHref,
      learningPathHref,
      isMilestoneCompleted: Boolean(isTargetCompleted),
      milestoneTitle: targetMilestone?.title || null,
    });
  }

  const gaps = deduplicatedGaps.sort((a, b) => (a.severity === "critical" ? -1 : b.severity === "critical" ? 1 : 0));

  return {
    overallHealth,
    criticalGaps,
    moderateGaps,
    strongSkills,
    gaps
  };
};
