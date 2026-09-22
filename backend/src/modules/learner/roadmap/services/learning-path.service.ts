import prisma from "../../../../lib/prisma.js";
import { ChatService } from "../../copilot/services/chat.service.js";
import {
  getCanonicalRoleDefinition,
  type CanonicalRoleDefinition,
  type CanonicalMilestoneTemplate,
} from "../../career-alignment/services/career-skills.map.js";
import { isMatchingSkill } from "../../assessments/services/skill-simulation.service.js";
import { z } from "zod";

export const RoadmapMilestoneSchema = z.object({
  title: z.string().min(3),
  phase: z
    .enum([
      "FOUNDATIONS",
      "CORE_CONCEPTS",
      "INTERMEDIATE_SYSTEMS",
      "ADVANCED_ARCHITECTURE",
      "PRACTICAL_PROJECTS",
      "SPECIALIZATION",
      "PRODUCTION_PORTFOLIO",
      "JOB_READINESS",
    ])
    .default("CORE_CONCEPTS"),
  skillsCovered: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  estimatedTime: z.string().default("2-3 weeks"),
  description: z.string().min(10),
  whyItMatters: z.string().min(10),
  prerequisites: z.array(z.string()).default([]),
  projectDeliverable: z.string().optional(),
  expectedOutcome: z.string().optional(),
});

export const RoadmapResponseSchema = z.object({
  roadmapTitle: z.string().min(3),
  targetRole: z.string().min(2),
  domain: z.string().optional(),
  milestones: z.array(RoadmapMilestoneSchema).min(5, "A complete roadmap requires at least 5 progressive stages"),
});

export type RoadmapResponse = z.infer<typeof RoadmapResponseSchema>;

/**
 * Validates that a generated roadmap represents a complete learning journey for the target role
 * and is not merely an abbreviated list of skill gaps or random technologies.
 */
export function validateRoadmapCompleteness(
  roadmap: any,
  _targetRole: string,
  canonicalRole: CanonicalRoleDefinition
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const expectedMinStages = Math.max(5, canonicalRole.milestones.length - 1);
  const expectedMaxStages = canonicalRole.milestones.length + 2;

  if (!roadmap || !Array.isArray(roadmap.milestones) || roadmap.milestones.length < expectedMinStages) {
    errors.push(
      `Roadmap has only ${roadmap?.milestones?.length || 0} milestones; complete role curriculum for ${canonicalRole.roleName} requires at least ${expectedMinStages} progressive stages.`
    );
    return { valid: false, errors };
  }

  if (roadmap.milestones.length > expectedMaxStages) {
    errors.push(
      `Roadmap has ${roadmap.milestones.length} milestones, which exceeds the focused curriculum limit (${expectedMaxStages}) for ${canonicalRole.roleName}.`
    );
    return { valid: false, errors };
  }

  // 1. Check foundational stage exists
  const hasFoundations = roadmap.milestones.some(
    (m: any) =>
      m.phase === "FOUNDATIONS" ||
      m.type === "FOUNDATIONS" ||
      m.type === "CORE_CONCEPTS" ||
      (m.title && /foundation|basics|fundamentals|core principles/i.test(m.title))
  );
  if (!hasFoundations) {
    errors.push("Roadmap is missing a clear Foundations & Core Principles stage.");
  }

  // 2. Check practical project / capstone / portfolio deliverable exists
  const hasProjectsOrPortfolio = roadmap.milestones.some(
    (m: any) =>
      m.phase === "PRACTICAL_PROJECTS" ||
      m.type === "PRACTICAL_PROJECTS" ||
      m.phase === "PRODUCTION_PORTFOLIO" ||
      m.type === "PRODUCTION_PORTFOLIO" ||
      m.phase === "JOB_READINESS" ||
      m.type === "JOB_READINESS" ||
      (m.title && /project|capstone|portfolio|case study/i.test(m.title)) ||
      Boolean(m.projectDeliverable)
  );
  if (!hasProjectsOrPortfolio) {
    errors.push("Roadmap is missing a practical project deliverable, portfolio, or job-readiness stage.");
  }

  // 3. Domain relevance check: Ensure covered skills match canonical role domain
  const canonicalCriticalSkills = canonicalRole.requiredSkills.filter((s) => s.critical).map((s) => s.skill);
  const allRoadmapSkills: string[] = roadmap.milestones.flatMap((m: any) => [
    ...(m.skillsCovered || []),
    ...(m.technologies || []),
    ...(m.unlocks || []),
  ]);

  if (canonicalCriticalSkills.length > 0) {
    const matchedCanonical = canonicalCriticalSkills.filter((req) =>
      allRoadmapSkills.some((s) => isMatchingSkill(s, req))
    );
    const matchRatio = matchedCanonical.length / canonicalCriticalSkills.length;
    if (matchRatio < 0.3) {
      errors.push(
        `Roadmap covers only ${Math.round(matchRatio * 100)}% of canonical critical skills for ${canonicalRole.roleName}.`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Builds a deterministic, complete, multi-stage roadmap from the canonical/dynamic role definition.
 * Used as an instant fallback when AI is unavailable or produces incomplete output.
 */
export function generateDeterministicRoadmap(
  targetRole: string,
  _experienceLevel?: string,
  weeklyHours: number = 15
): RoadmapResponse {
  const canonicalRole = getCanonicalRoleDefinition(targetRole);
  const weeksMultiplier = weeklyHours < 10 ? "3-4 weeks" : weeklyHours < 20 ? "2-3 weeks" : "1-2 weeks";

  const milestones = canonicalRole.milestones.map((tmpl: CanonicalMilestoneTemplate) => ({
    title: tmpl.title,
    phase: tmpl.phase,
    skillsCovered: tmpl.skillsCovered,
    technologies: tmpl.technologies,
    estimatedTime: tmpl.estimatedTime || weeksMultiplier,
    description: tmpl.description,
    whyItMatters: tmpl.whyItMatters,
    prerequisites: tmpl.prerequisites || [],
    projectDeliverable: tmpl.projectDeliverable,
    expectedOutcome: tmpl.expectedOutcome,
  }));

  return {
    roadmapTitle: `${canonicalRole.roleName} Mastery Roadmap`,
    targetRole: canonicalRole.roleName,
    domain: canonicalRole.domain,
    milestones,
  };
}

/**
 * Personalizes milestone statuses (COMPLETED, CURRENT, UPCOMING) based on learner SkillState
 * WITHOUT deleting or omitting any canonical curriculum nodes.
 */
export function overlayLearnerSkillState(
  milestones: any[],
  skillStates: any[]
): Array<any & { status: "COMPLETED" | "CURRENT" | "UPCOMING"; progress: number }> {
  let activeFrontierAssigned = false;

  return milestones.map((milestone, _idx) => {
    const coveredSkills: string[] = milestone.skillsCovered || milestone.unlocks || [];
    let milestoneProgress = 0;

    if (coveredSkills.length > 0) {
      let totalScore = 0;
      let evaluatedCount = 0;

      for (const skill of coveredSkills) {
        const state = skillStates.find((s) =>
          isMatchingSkill(s.skillName || s.skill?.name || s.name, skill)
        );
        if (state) {
          totalScore += state.knowledgeScore ?? state.verifiedScore ?? state.score ?? 0;
          evaluatedCount++;
        }
      }

      if (evaluatedCount > 0) {
        milestoneProgress = Math.round(totalScore / coveredSkills.length);
      }
    }

    let status: "COMPLETED" | "CURRENT" | "UPCOMING";

    if (milestoneProgress >= 70) {
      status = "COMPLETED";
    } else if (!activeFrontierAssigned) {
      status = "CURRENT";
      activeFrontierAssigned = true;
    } else {
      status = "UPCOMING";
    }

    return {
      ...milestone,
      status,
      progress: status === "COMPLETED" ? 100 : status === "CURRENT" ? Math.max(15, milestoneProgress) : 0,
    };
  });
}

/**
 * Core Service: Retrieves existing roadmap or generates a complete, clean, role-specific roadmap.
 */
export const getOrGenerateLearningPath = async (userId: string) => {
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("Career profile not found.");
  }

  // 1. Target role from existing onboarding is the single source of truth
  const targetRole = profile.targetRoleName || profile.targetRole || "Software Engineer";
  const canonicalRole = getCanonicalRoleDefinition(targetRole);

  // 2. Fetch learner SkillState for personalization overlay only
  const skillStates = await prisma.skillState.findMany({
    where: { userId },
  });

  // 3. Check for existing active roadmap
  let existingRoadmap = await prisma.roadmap.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      milestones: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // If no ACTIVE roadmap found, check if a previous roadmap exists for this user to restore their progress
  if (!existingRoadmap) {
    const previousRoadmap = await prisma.roadmap.findFirst({
      where: { userId },
      include: {
        milestones: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (previousRoadmap && previousRoadmap.milestones.length > 0) {
      await prisma.roadmap.update({
        where: { id: previousRoadmap.id },
        data: { status: "ACTIVE" },
      });
      existingRoadmap = previousRoadmap;
    }
  }

  const isMatchingRole = (rRole?: string | null) => {
    if (!rRole) return false;
    const cleanRoadmap = rRole.toLowerCase().trim();
    const cleanTarget = targetRole.toLowerCase().trim();
    const cleanCanonical = canonicalRole.roleName.toLowerCase().trim();
    if (cleanRoadmap === cleanTarget || cleanRoadmap === cleanCanonical) return true;
    return canonicalRole.aliases.some((a) => a.toLowerCase().trim() === cleanRoadmap);
  };

  // If existing active roadmap matches the learner's current target role, PERSIST IT PERMANENTLY!
  // Never re-generate with AI or wipe completed milestones on page visits or route transitions.
  if (existingRoadmap && isMatchingRole(existingRoadmap.targetRole) && existingRoadmap.milestones.length > 0) {
    return await formatLearningPathResponse(existingRoadmap, existingRoadmap.targetRole || targetRole);
  }

  // 4. Archive any old roadmaps before creating the new complete curriculum
  await prisma.roadmap.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "ARCHIVED" },
  });

  // 5. Construct AI Prompt anchored strictly to the CANONICAL ROLE BLUEPRINT
  const canonicalBlueprint = canonicalRole.milestones
    .map(
      (m, idx) => `Stage ${idx + 1}: "${m.title}" [Phase: ${m.phase}]
- Focus: ${m.description}
- Skills: ${m.skillsCovered.join(", ")}
- Technologies: ${m.technologies.join(", ")}
- Strategic Importance: ${m.whyItMatters}
- Hands-on Deliverable: ${m.projectDeliverable || "Concrete practical deliverable"}`
    )
    .join("\n\n");

  const prompt = `
You are the Chief Curriculum Architect for AI Pather. Generate the complete, definitive learning roadmap for the target role: "${canonicalRole.roleName}".

TARGET ROLE SPECIFICATION:
- Role: ${canonicalRole.roleName}
- Domain: ${canonicalRole.domain}
- Role Description: ${canonicalRole.description}
- Learner Experience Level: ${profile.experienceLevel}
- Available Learning Time: ${profile.weeklyAvailableHours || 15} hours/week

CANONICAL ROLE CURRICULUM BLUEPRINT (${canonicalRole.milestones.length} progressive stages for ${canonicalRole.roleName}):
${canonicalBlueprint}

CRITICAL CURRICULUM INTEGRITY RULES (STRICT):
1. COMPLETE ROLE COVERAGE: Generate the exact, comprehensive learning path for "${canonicalRole.roleName}".
2. EXACT NATURAL STAGES - NO CUTS, NO BLOAT: You must faithfully follow the ${canonicalRole.milestones.length} progressive stages defined in the CANONICAL ROLE CURRICULUM BLUEPRINT above.
   - Do NOT cut corners or omit critical stages (every stage in the blueprint is essential for job readiness).
   - Do NOT add unnecessary, arbitrary, or bloated extra stages. Output exactly ${canonicalRole.milestones.length} progressive milestones.
3. PERSONALIZATION: Tailor each milestone's descriptions, learning pace (estimatedTime), and hands-on deliverables to the learner's experience level (${profile.experienceLevel}) and weekly study time (${profile.weeklyAvailableHours || 15} hours/week).
4. PROJECT DELIVERABLE: Every milestone MUST have a tangible projectDeliverable and whyItMatters explaining its career impact.

Format ONLY as valid JSON matching this schema:
{
  "roadmapTitle": "${canonicalRole.roleName} Mastery Roadmap",
  "targetRole": "${canonicalRole.roleName}",
  "domain": "${canonicalRole.domain}",
  "milestones": [
    {
      "title": "Milestone Title",
      "phase": "FOUNDATIONS",
      "skillsCovered": ["Skill 1", "Skill 2"],
      "technologies": ["Tech 1", "Tech 2"],
      "estimatedTime": "2-3 weeks",
      "description": "Comprehensive description of concepts taught",
      "whyItMatters": "Why this milestone is essential for ${canonicalRole.roleName}",
      "prerequisites": [],
      "projectDeliverable": "Practical hands-on deliverable for this stage",
      "expectedOutcome": "Tangible competency gained"
    }
  ]
}`;

  let generatedRoadmap: RoadmapResponse;

  try {
    const aiResult = await ChatService.processJsonCompletion(
      "You output strictly valid JSON matching the requested roadmap schema. Do not output markdown or explanations.",
      prompt
    );
    let content = aiResult.reply.trim();

    const startIdx = content.indexOf("{");
    const endIdx = content.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1) {
      content = content.slice(startIdx, endIdx + 1);
    }

    const rawJson = JSON.parse(content);
    const parsed = RoadmapResponseSchema.parse(rawJson);
    const completeness = validateRoadmapCompleteness(parsed, targetRole, canonicalRole);

    if (!completeness.valid) {
      console.warn("AI generated roadmap failed completeness validation:", completeness.errors);
      // Attempt structured auto-repair
      const repairPrompt = `The previous roadmap output for ${canonicalRole.roleName} had these deficiencies:
${completeness.errors.join("\n")}

Please fix these issues and regenerate the COMPLETE, professional roadmap JSON for ${canonicalRole.roleName}.`;

      try {
        const repairResult = await ChatService.processJsonCompletion(
          "You output strictly valid JSON matching the requested roadmap schema.",
          repairPrompt
        );
        let repContent = repairResult.reply.trim();
        const repStart = repContent.indexOf("{");
        const repEnd = repContent.lastIndexOf("}");
        if (repStart !== -1 && repEnd !== -1) {
          repContent = repContent.slice(repStart, repEnd + 1);
        }
        const repairedJson = JSON.parse(repContent);
        const repParsed = RoadmapResponseSchema.parse(repairedJson);
        const repValidation = validateRoadmapCompleteness(repParsed, targetRole, canonicalRole);

        if (repValidation.valid) {
          generatedRoadmap = repParsed;
        } else {
          console.warn("Repaired roadmap still incomplete; using canonical deterministic fallback.");
          generatedRoadmap = generateDeterministicRoadmap(targetRole, profile.experienceLevel, profile.weeklyAvailableHours || 15);
        }
      } catch (repairErr) {
        console.warn("AI repair failed; using canonical deterministic fallback:", repairErr);
        generatedRoadmap = generateDeterministicRoadmap(targetRole, profile.experienceLevel, profile.weeklyAvailableHours || 15);
      }
    } else {
      generatedRoadmap = parsed;
    }
  } catch (error) {
    console.warn("AI roadmap generation failed; utilizing canonical deterministic fallback:", error);
    generatedRoadmap = generateDeterministicRoadmap(targetRole, profile.experienceLevel, profile.weeklyAvailableHours || 15);
  }

  // 5. Personalize milestone statuses using learner SkillState overlay without deleting any stages
  const personalizedMilestones = overlayLearnerSkillState(generatedRoadmap.milestones, skillStates);

  // 6. Save Roadmap in Database
  const roadmap = await prisma.roadmap.create({
    data: {
      userId,
      targetRole: canonicalRole.roleName,
      status: "ACTIVE",
    },
  });

  const milestonesData = personalizedMilestones.map((m, index) => ({
    roadmapId: roadmap.id,
    order: index + 1,
    title: m.title,
    description: m.description,
    status: m.status,
    type: m.phase,
    estimatedTime: m.estimatedTime,
    why: m.whyItMatters,
    unlocks: m.skillsCovered || [],
  }));

  await prisma.milestone.createMany({
    data: milestonesData,
  });

  // Record Activity Log
  await prisma.activityLog.create({
    data: {
      userId,
      type: "LEARNING",
      description: `Generated complete learning roadmap for ${canonicalRole.roleName}`,
    },
  }).catch((err) => console.error("Failed to log activity:", err));

  const savedRoadmap = await prisma.roadmap.findUniqueOrThrow({
    where: { id: roadmap.id },
    include: {
      milestones: {
        orderBy: { order: "asc" },
      },
    },
  });

  return await formatLearningPathResponse(savedRoadmap, targetRole);
};

export async function formatLearningPathResponse(roadmap: any, targetRole: string) {
  const canonicalRole = getCanonicalRoleDefinition(targetRole);

  const userProjects = roadmap.userId
    ? await prisma.project.findMany({
        where: { userId: roadmap.userId },
        select: { id: true, title: true, specification: true },
      })
    : [];

  const milestones = (roadmap.milestones || []).map((m: any) => {
    const cleanTitle = (m.title || "").toLowerCase().trim();
    const matchedProject = userProjects.find((p) => {
      const spec = p.specification as any;
      if (spec?.milestoneId && spec.milestoneId === m.id) return true;
      const specTitle = (spec?.milestoneTitle || "").toLowerCase().trim();
      if (
        specTitle &&
        (specTitle === cleanTitle ||
          specTitle.includes(cleanTitle) ||
          cleanTitle.includes(specTitle))
      )
        return true;
      const forContext = (spec?.generatedForContext || "").toLowerCase().trim();
      if (
        forContext &&
        (forContext.includes(cleanTitle) || cleanTitle.includes(forContext))
      )
        return true;
      const obj = (spec?.primaryLearningObjective || "").toLowerCase().trim();
      if (
        obj &&
        (obj === cleanTitle || obj.includes(cleanTitle) || cleanTitle.includes(obj))
      )
        return true;
      const pTitle = (p.title || "").toLowerCase().trim();
      if (
        pTitle &&
        (pTitle.includes(cleanTitle) || cleanTitle.includes(pTitle))
      )
        return true;
      return false;
    });

    return {
      id: m.id,
      title: m.title,
      status: m.status.toLowerCase(), // completed, current, upcoming
      progress: m.status === "COMPLETED" ? 100 : m.status === "CURRENT" ? 15 : 0,
      skillsCovered: m.unlocks || [],
      estimatedTime: m.estimatedTime || "2-3 weeks",
      description: m.description || "",
      whyItMatters: m.why || "",
      phase: m.type || "CORE_CONCEPTS",
      hasProject: Boolean(matchedProject),
      projectId: matchedProject?.id || null,
    };
  });

  const completedCount = milestones.filter((m: any) => m.status === "completed").length;
  const overallProgress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;
  
  const currentMilestone = milestones.find((m: any) => m.status === "current") || milestones[0];

  return {
    roadmapTitle: `${canonicalRole.roleName} Mastery Roadmap`,
    targetRole: canonicalRole.roleName,
    overallProgress,
    milestones,
    nextAction: currentMilestone ? {
      title: `Continue: ${currentMilestone.title}`,
      href: "/dashboard/learner/learning-path"
    } : null
  };
}

/**
 * Dynamically computes gem reward for a milestone:
 * - Small / Introductory milestone (≤ 8 hrs or foundations): +2 💎
 * - Medium practical milestone (9–20 hrs or intermediate): +4 💎
 * - Advanced capstone / architectural milestone (21+ hrs or portfolio): +8 💎
 */
function calculateMilestoneGems(estimatedTime?: string | null, type?: string | null): number {
  if (!estimatedTime && !type) return 2;
  const timeStr = (estimatedTime || "").toLowerCase();
  const typeStr = (type || "").toUpperCase();

  if (
    typeStr.includes("PORTFOLIO") ||
    typeStr.includes("CAPSTONE") ||
    typeStr.includes("ADVANCED") ||
    timeStr.includes("month") ||
    timeStr.includes("3 week") ||
    timeStr.includes("4 week")
  ) {
    return 8;
  }

  const hourMatch = timeStr.match(/(\d+)\s*(?:-|to)?\s*(\d+)?\s*(?:hours|hrs|hr)/);
  if (hourMatch) {
    const rawVal = hourMatch[2] || hourMatch[1] || "0";
    const maxHour = parseInt(rawVal, 10);
    if (maxHour <= 8) return 2;
    if (maxHour <= 20) return 4;
    return 8;
  }

  const weekMatch = timeStr.match(/(\d+)\s*(?:-|to)?\s*(\d+)?\s*(?:weeks|wks|wk)/);
  if (weekMatch) {
    const rawVal = weekMatch[2] || weekMatch[1] || "0";
    const maxWeek = parseInt(rawVal, 10);
    if (maxWeek >= 2) return 8;
    return 4;
  }

  if (typeStr.includes("PROJECT") || typeStr.includes("INTERMEDIATE")) {
    return 4;
  }

  return 2;
}

export const completeMilestone = async (userId: string, milestoneId: string) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { roadmap: true }
  });

  if (!milestone) throw new Error("Milestone not found");
  if (milestone.roadmap.userId !== userId) throw new Error("Unauthorized");
  if (milestone.status === "COMPLETED") throw new Error("Milestone already completed");

  // Verify prerequisite milestones are completed (sequential unlocking enforcement)
  const uncompletedPrerequisite = await prisma.milestone.findFirst({
    where: {
      roadmapId: milestone.roadmapId,
      order: { lt: milestone.order },
      status: { not: "COMPLETED" },
    },
  });

  if (uncompletedPrerequisite) {
    throw new Error("Cannot complete this milestone: previous prerequisite milestones must be completed first");
  }

  // 1. Mark this milestone as COMPLETED
  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { status: "COMPLETED" }
  });

  // 2. Find next milestone and make it CURRENT
  const nextMilestone = await prisma.milestone.findFirst({
    where: {
      roadmapId: milestone.roadmapId,
      order: { gt: milestone.order }
    },
    orderBy: { order: "asc" }
  });

  if (nextMilestone && nextMilestone.status !== "COMPLETED") {
    await prisma.milestone.update({
      where: { id: nextMilestone.id },
      data: { status: "CURRENT" }
    });
  }

  // 3. Elevate proficiency and resolve skill gaps for covered skills
  if (milestone.unlocks && milestone.unlocks.length > 0) {
    const userExistingSkills = await prisma.skillState.findMany({
      where: { userId },
    });

    for (const skill of milestone.unlocks) {
      // Find exact or matching alias skill states
      const matchingStates = userExistingSkills.filter((s) => isMatchingSkill(s.skillName, skill));
      const targetScore = 75; // Passing proficiency threshold to resolve critical/moderate gaps

      if (matchingStates.length > 0) {
        for (const state of matchingStates) {
          const newKnowledge = Math.max(targetScore, Math.min(100, state.knowledgeScore + 30));
          const newPractice = Math.max(65, state.practiceScore);

          const updatedSkill = await prisma.skillState.update({
            where: { id: state.id },
            data: {
              knowledgeScore: newKnowledge,
              practiceScore: newPractice,
              lastReviewed: new Date(),
            },
          });

          await prisma.skillStateHistory
            .create({
              data: {
                userId,
                skillName: state.skillName,
                knowledgeScore: updatedSkill.knowledgeScore,
                practiceScore: updatedSkill.practiceScore,
                projectScore: updatedSkill.projectScore,
                evidenceScore: updatedSkill.evidenceScore,
              },
            })
            .catch((err) =>
              console.error("Failed to record skill state history on milestone complete:", err)
            );
        }
      } else {
        // Create fresh skill state with proficient scores
        const newSkill = await prisma.skillState.create({
          data: {
            userId,
            skillName: skill,
            knowledgeScore: targetScore,
            practiceScore: 65,
            projectScore: 0,
            evidenceScore: 0,
            lastReviewed: new Date(),
          },
        });

        await prisma.skillStateHistory
          .create({
            data: {
              userId,
              skillName: skill,
              knowledgeScore: newSkill.knowledgeScore,
              practiceScore: newSkill.practiceScore,
              projectScore: newSkill.projectScore,
              evidenceScore: newSkill.evidenceScore,
            },
          })
          .catch((err) =>
            console.error("Failed to record skill state history on milestone complete:", err)
          );
      }
    }
  }

  // 4. Log activity
  await prisma.activityLog.create({
    data: {
      userId,
      type: "LEARNING",
      description: `Completed milestone: ${milestone.title}`,
      metadata: { milestoneId: milestone.id, title: milestone.title, durationMinutes: 30 },
    }
  }).catch((err) => console.error("Failed to log activity:", err));

  // 5. Award Milestone Completion XP & Evaluate Achievements
  try {
    const { awardXp, evaluateAchievements } = await import(
      "../../gamification/services/gamification.service.js"
    );
    await awardXp(
      userId,
      "MILESTONE_COMPLETION",
      milestone.id,
      150,
      `Completed milestone: ${milestone.title}`,
    );
    await evaluateAchievements(userId);
  } catch (err) {
    console.error("Failed to award gamification XP for milestone:", err);
  }

  // 5b. Award Dynamic Milestone Gems (2, 4, or 8 💎 based on complexity & hours)
  try {
    const { awardGems } = await import("../../gem-economy/services/gem-economy.service.js");
    const gemReward = calculateMilestoneGems(milestone.estimatedTime, milestone.type);
    await awardGems(
      userId,
      gemReward,
      "MILESTONE_COMPLETED",
      `Completed milestone: ${milestone.title} (+${gemReward} 💎)`,
      milestone.id,
    );
  } catch (err) {
    console.error("Failed to award milestone gems:", err);
  }

  // 6. Create real Notification
  try {
    const { createNotification } = await import("../../notifications/services/notification.service.js");
    await createNotification({
      userId,
      type: "MILESTONE",
      title: "Milestone Completed",
      message: `You completed "${milestone.title}".`,
      metadata: { milestoneId: milestone.id, title: milestone.title },
    });
  } catch (err) {
    console.error("Failed to create milestone notification:", err);
  }

  const updatedRoadmap = await prisma.roadmap.findUniqueOrThrow({
    where: { id: milestone.roadmapId },
    include: {
      milestones: {
        orderBy: { order: "asc" }
      }
    }
  });

  return await formatLearningPathResponse(updatedRoadmap, updatedRoadmap.targetRole);
};
