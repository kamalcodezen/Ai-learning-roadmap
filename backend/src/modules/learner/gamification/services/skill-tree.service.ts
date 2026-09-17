import prisma from "../../../../lib/prisma.js";
import { getRequiredSkillsForRole } from "../../career-alignment/services/career-skills.map.js";
import { isMatchingSkill } from "../../assessments/services/skill-simulation.service.js";
import type { SkillTreeNode, SkillTreeNodeStatus } from "../gamification.types.js";

export const getSkillTree = async (userId: string) => {
  const [profile, skillStates, roadmaps, projectEvidences] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.skillState.findMany({ where: { userId } }),
    prisma.roadmap.findMany({
      where: { userId },
      include: { milestones: { orderBy: { order: "asc" } } },
    }),
    prisma.projectEvidence.findMany({ where: { userId } }),
  ]);

  const targetRole = profile?.targetRoleName || profile?.targetRole || "Full-Stack Developer";
  const requiredSkills = getRequiredSkillsForRole(targetRole);

  const activeMilestones = roadmaps.flatMap((r) => r.milestones);
  const completedMilestoneSkills = new Set(
    activeMilestones
      .filter((m) => m.status === "COMPLETED")
      .flatMap((m) => (Array.isArray(m.unlocks) ? m.unlocks : []).map((s) => s.toLowerCase())),
  );

  const nodes: SkillTreeNode[] = [];

  requiredSkills.forEach((req, index) => {
    const skillNameLower = req.skill.toLowerCase();
    const state = skillStates.find((s) => isMatchingSkill(s.skillName, req.skill));

    const knowledgeScore = state?.knowledgeScore ?? 0;
    const practiceScore = state?.practiceScore ?? 0;
    const projectScore = state?.projectScore ?? 0;
    const evidenceScore = state?.evidenceScore ?? 0;

    const activeComps: number[] = [];
    if (knowledgeScore > 0) activeComps.push(knowledgeScore);
    if (practiceScore > 0) activeComps.push(practiceScore);
    if (projectScore > 0) activeComps.push(projectScore);
    if (evidenceScore > 0) activeComps.push(evidenceScore);

    const compositeScore = Math.round(
      knowledgeScore * 0.4 + practiceScore * 0.3 + projectScore * 0.3,
    );

    const effectiveMasteryScore =
      activeComps.length > 0
        ? Math.round(activeComps.reduce((a, b) => a + b, 0) / activeComps.length)
        : compositeScore;

    const hasVerifiedEvidence = projectEvidences.some((e) =>
      isMatchingSkill(e.skillName, req.skill),
    );

    let status: SkillTreeNodeStatus = "LOCKED";

    if (
      effectiveMasteryScore >= 70 ||
      knowledgeScore >= 75 ||
      practiceScore >= 65 ||
      (completedMilestoneSkills.has(skillNameLower) && hasVerifiedEvidence)
    ) {
      status = "MASTERED";
    } else if (
      effectiveMasteryScore > 0 ||
      knowledgeScore > 0 ||
      practiceScore > 0 ||
      completedMilestoneSkills.has(skillNameLower)
    ) {
      status = "IN_PROGRESS";
    } else if (index < 3 || req.critical) {
      // Foundational or critical skills start available
      status = "AVAILABLE";
    } else {
      // Non-critical skills become available if at least 1 critical skill is in progress or mastered
      const anyCriticalStarted = requiredSkills
        .filter((r) => r.critical)
        .some((r) => skillStates.some((s) => isMatchingSkill(s.skillName, r.skill) && s.knowledgeScore > 0));
      status = anyCriticalStarted ? "AVAILABLE" : "LOCKED";
    }

    const prevSkill = index > 0 ? requiredSkills[index - 1]?.skill : null;
    const firstSkill = requiredSkills[0]?.skill;

    nodes.push({
      id: `skill-node-${index + 1}`,
      name: req.skill,
      category: req.critical ? "Core Competency" : "Supporting Proficiency",
      status,
      masteryScore: effectiveMasteryScore,
      knowledgeScore,
      practiceScore,
      projectScore,
      evidenceScore,
      isCritical: req.critical,
      dependencies: prevSkill ? [prevSkill] : [],
      unlockedBy: index === 0 ? [] : (firstSkill ? [firstSkill] : []),
    });
  });

  const masteredCount = nodes.filter((n) => n.status === "MASTERED").length;
  const inProgressCount = nodes.filter((n) => n.status === "IN_PROGRESS").length;
  const availableCount = nodes.filter((n) => n.status === "AVAILABLE").length;
  const lockedCount = nodes.filter((n) => n.status === "LOCKED").length;

  return {
    targetRole,
    totalSkills: nodes.length,
    masteredCount,
    inProgressCount,
    availableCount,
    lockedCount,
    nodes,
  };
};
