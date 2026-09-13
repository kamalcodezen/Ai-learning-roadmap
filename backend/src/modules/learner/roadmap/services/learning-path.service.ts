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

  if (!roadmap || !Array.isArray(roadmap.milestones) || roadmap.milestones.length < 5) {
    errors.push(
      `Roadmap has only ${roadmap?.milestones?.length || 0} milestones; complete role curriculum requires multiple progressive stages (minimum 5).`
    );
    return { valid: false, errors };
  }

  // 1. Check foundational stage exists
  const hasFoundations = roadmap.milestones.some(
    (m: any) =>
      m.phase === "FOUNDATIONS" ||
      (m.title && /foundation|basics|fundamentals|core principles/i.test(m.title))
  );
  if (!hasFoundations) {
    errors.push("Roadmap is missing a clear Foundations & Core Principles stage.");
  }

  // 2. Check practical project / capstone / portfolio deliverable exists
  const hasProjectsOrPortfolio = roadmap.milestones.some(
    (m: any) =>
      m.phase === "PRACTICAL_PROJECTS" ||
      m.phase === "PRODUCTION_PORTFOLIO" ||
      m.phase === "JOB_READINESS" ||
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
  const existingRoadmap = await prisma.roadmap.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      targetRole: { in: [targetRole, profile.targetRole, profile.targetRoleName, canonicalRole.roleName].filter(Boolean) as string[] },
    },
    include: {
      milestones: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (existingRoadmap && existingRoadmap.milestones.length >= 5) {
    const completenessCheck = validateRoadmapCompleteness(existingRoadmap, targetRole, canonicalRole);
    if (completenessCheck.valid) {
      return formatLearningPathResponse(existingRoadmap, targetRole);
    }
  }

  // If existing roadmap was incomplete, legacy, or missing, archive older roadmaps
  await prisma.roadmap.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "ARCHIVED" },
  });

  // 4. Construct AI Prompt focused purely on the CANONICAL ROLE CURRICULUM
  const prompt = `
You are the Chief Curriculum Architect for AI Pather. Generate a complete, professional learning roadmap for the target role: "${canonicalRole.roleName}".

TARGET ROLE SPECIFICATION:
- Role: ${canonicalRole.roleName}
- Domain: ${canonicalRole.domain}
- Role Description: ${canonicalRole.description}
- Learner Experience Level: ${profile.experienceLevel}
- Available Learning Time: ${profile.weeklyAvailableHours || 15} hours/week

CANONICAL CURRICULUM REQUIREMENTS:
The roadmap must represent the COMPLETE learning journey required to achieve job-readiness for this role:
1. FOUNDATIONS: Core principles, environment setup, fundamental syntax/tools.
2. CORE_CONCEPTS: Domain architecture, primary frameworks, component lifecycles, and data modeling.
3. INTERMEDIATE_SYSTEMS: Security, state management, relational databases, backend APIs, or domain workflows.
4. ADVANCED_ARCHITECTURE: Scalability, performance optimization, concurrency, or advanced domain tools.
5. PRACTICAL_PROJECTS: End-to-end verified project deliverable.
6. JOB_READINESS: Production capstone, portfolio presentation, and technical interview readiness.

CRITICAL INSTRUCTIONS:
- You MUST generate a complete curriculum tailored specifically to ${canonicalRole.roleName}.
- Do NOT output generic placeholder milestones.
- Do NOT restrict the curriculum to only 5 items if the role requires comprehensive coverage. Generate between 6 and 9 progressive milestones.
- Every milestone MUST have a clear title, phase, skillsCovered, technologies, realistic estimatedTime, description, whyItMatters, and projectDeliverable.

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

  return formatLearningPathResponse(savedRoadmap, targetRole);
};

export function formatLearningPathResponse(roadmap: any, targetRole: string) {
  const canonicalRole = getCanonicalRoleDefinition(targetRole);

  const milestones = (roadmap.milestones || []).map((m: any) => ({
    id: m.id,
    title: m.title,
    status: m.status.toLowerCase(), // completed, current, upcoming
    progress: m.status === "COMPLETED" ? 100 : m.status === "CURRENT" ? 15 : 0,
    skillsCovered: m.unlocks || [],
    estimatedTime: m.estimatedTime || "2-3 weeks",
    description: m.description || "",
    whyItMatters: m.why || "",
    phase: m.type || "CORE_CONCEPTS",
  }));

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

export const completeMilestone = async (userId: string, milestoneId: string) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { roadmap: true }
  });

  if (!milestone) throw new Error("Milestone not found");
  if (milestone.roadmap.userId !== userId) throw new Error("Unauthorized");
  if (milestone.status === "COMPLETED") throw new Error("Milestone already completed");

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

  // 3. Add knowledge points for covered skills
  if (milestone.unlocks && milestone.unlocks.length > 0) {
    for (const skill of milestone.unlocks) {
      const existingSkill = await prisma.skillState.findUnique({
        where: { userId_skillName: { userId, skillName: skill } }
      });
      let updatedSkill;
      if (existingSkill) {
        updatedSkill = await prisma.skillState.update({
          where: { id: existingSkill.id },
          data: { knowledgeScore: Math.min(100, existingSkill.knowledgeScore + 15) }
        });
      } else {
        updatedSkill = await prisma.skillState.create({
          data: {
            userId,
            skillName: skill,
            knowledgeScore: 15,
            practiceScore: 0,
            projectScore: 0,
            evidenceScore: 0
          }
        });
      }

      await prisma.skillStateHistory.create({
        data: {
          userId,
          skillName: skill,
          knowledgeScore: updatedSkill.knowledgeScore,
          practiceScore: updatedSkill.practiceScore,
          projectScore: updatedSkill.projectScore,
          evidenceScore: updatedSkill.evidenceScore,
        }
      }).catch((err) => console.error("Failed to record skill state history on milestone complete:", err));
    }
  }

  // 4. Log activity
  await prisma.activityLog.create({
    data: {
      userId,
      type: "LEARNING",
      description: `Completed milestone: ${milestone.title}`
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

  return formatLearningPathResponse(updatedRoadmap, updatedRoadmap.targetRole);
};
