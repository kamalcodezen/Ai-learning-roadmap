import prisma from "../../../../lib/prisma.js";
import { ChatService } from "../../copilot/services/chat.service.js";
import { getRequiredSkillsForRole } from "../../career-alignment/services/career-skills.map.js";
import { isMatchingSkill } from "../../assessments/services/skill-simulation.service.js";
import { z } from "zod";

const RoadmapResponseSchema = z.object({
  roadmapTitle: z.string(),
  milestones: z.array(z.object({
    title: z.string(),
    skillsCovered: z.array(z.string()).default([]),
    estimatedTime: z.string(),
    description: z.string(),
    whyItMatters: z.string()
  })).min(1, "Must have at least one milestone")
});

export function generateDeterministicRoadmap(
  targetRole: string,
  _experienceLevel: string,
  weeklyHours: number,
  identifiedGaps: string[],
  canonicalSkills: Array<{ skill: string; category?: string; priority?: number }>
): z.infer<typeof RoadmapResponseSchema> {
  const allSkills = identifiedGaps.length > 0
    ? [...new Set([...identifiedGaps, ...canonicalSkills.map(s => s.skill)])]
    : canonicalSkills.map(s => s.skill);

  const fallbackSkills = allSkills.length > 0 
    ? allSkills 
    : ["Core Principles", "Development Tools", "Frameworks", "Testing & Debugging", "Production Deployment"];

  const chunkCount = 5;
  const skillBuckets: string[][] = Array.from({ length: chunkCount }, () => []);
  fallbackSkills.forEach((skill, idx) => {
    const bucket = skillBuckets[idx % chunkCount];
    if (bucket) {
      bucket.push(skill);
    }
  });

  const weeksPerMilestone = weeklyHours < 10 ? "3-4 weeks" : weeklyHours < 20 ? "2-3 weeks" : "1-2 weeks";

  const milestoneTemplates = [
    {
      title: `${targetRole} Foundations & Core Principles`,
      desc: "Master foundational concepts, core syntax, and development environment setup.",
      why: "A robust conceptual foundation is critical for scalable engineering and architectural understanding.",
    },
    {
      title: "Framework Architecture & Data Flow",
      desc: "Implement practical components, application lifecycle management, and clean data structures.",
      why: "Modern production applications require modular component design and predictable state patterns.",
    },
    {
      title: "Fullstack Integration & API Communication",
      desc: "Connect client-side interfaces to resilient backend services, databases, and secure APIs.",
      why: "Real-world engineering demands robust API integration, data persistence, and error handling.",
    },
    {
      title: "Testing, Reliability & System Security",
      desc: "Establish automated test suites, input validation, authentication guards, and performance profiling.",
      why: "High-standard engineering teams mandate strict test coverage, security hygiene, and reliable execution.",
    },
    {
      title: "Production Deployment & Capstone Delivery",
      desc: "Containerize, deploy to cloud infrastructure, configure CI/CD pipelines, and polish technical evidence.",
      why: "Demonstrating verified production deployments is the #1 employer signal for hiring readiness.",
    },
  ];

  const milestones: Array<{
    title: string;
    skillsCovered: string[];
    estimatedTime: string;
    description: string;
    whyItMatters: string;
  }> = milestoneTemplates.map((tmpl, idx) => {
    const bucket = skillBuckets[idx] || [];
    const skillsCovered = bucket.length > 0 ? bucket : [`${targetRole} Module ${idx + 1}`];
    return {
      title: tmpl.title,
      skillsCovered,
      estimatedTime: weeksPerMilestone,
      description: tmpl.desc,
      whyItMatters: tmpl.why,
    };
  });

  return {
    roadmapTitle: `${targetRole} Mastery Roadmap`,
    milestones,
  };
}

export const getOrGenerateLearningPath = async (userId: string) => {
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("Career profile not found.");
  }

  const targetRole = profile.targetRoleName || profile.targetRole;

  const existingRoadmap = await prisma.roadmap.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      targetRole: { in: [targetRole, profile.targetRole, profile.targetRoleName].filter(Boolean) as string[] },
    },
    include: {
      milestones: {
        orderBy: { order: "asc" },
      },
    },
  });

  // Fetch skill states and calculate canonical gaps for evidence-based milestone planning
  const skillStates = await prisma.skillState.findMany({
    where: { userId },
  });

  const canonicalSkills = getRequiredSkillsForRole(targetRole);
  const identifiedGaps = canonicalSkills.filter(req => {
    const state = skillStates.find(s => isMatchingSkill(s.skillName, req.skill));
    return !state || state.knowledgeScore < 60;
  }).map(s => s.skill);

  // Also include any assessed critical gaps from diagnostic not already captured
  const assessedGaps = skillStates.filter(s => s.knowledgeScore < 60).map(s => s.skillName);
  for (const assessed of assessedGaps) {
    if (!identifiedGaps.some(g => isMatchingSkill(g, assessed))) {
      identifiedGaps.unshift(assessed);
    }
  }

  if (existingRoadmap && existingRoadmap.milestones.length > 0) {
    // Dynamic repair: Ensure existing active roadmap covers all canonical identifiedGaps
    for (const gap of identifiedGaps) {
      const isCovered = existingRoadmap.milestones.some((m: any) =>
        (m.unlocks || []).some((u: string) => isMatchingSkill(u, gap))
      );

      if (!isCovered) {
        const targetMilestone = existingRoadmap.milestones.find((m: any) => {
          const titleNorm = (m.title || "").toLowerCase();
          const descNorm = (m.description || "").toLowerCase();
          const gapNorm = gap.toLowerCase();
          return titleNorm.includes(gapNorm) || descNorm.includes(gapNorm);
        }) || existingRoadmap.milestones[1] || existingRoadmap.milestones[0];

        if (targetMilestone) {
          const currentUnlocks = Array.isArray(targetMilestone.unlocks) ? (targetMilestone.unlocks as string[]) : [];
          if (!currentUnlocks.some((u: string) => isMatchingSkill(u, gap))) {
            const updatedUnlocks = [...currentUnlocks, gap];
            targetMilestone.unlocks = updatedUnlocks;
            await prisma.milestone.update({
              where: { id: targetMilestone.id },
              data: { unlocks: updatedUnlocks }
            });
          }
        }
      }
    }

    return formatLearningPathResponse(existingRoadmap, targetRole);
  }

  // If no roadmap exists for current role, archive older ones
  await prisma.roadmap.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "ARCHIVED" },
  });

  const prompt = `
You are an expert AI Career Mentor for AI Pather. Generate a strictly JSON personalized learning roadmap for a learner.
- Target Role: ${targetRole}
- Experience Level: ${profile.experienceLevel}
- Weekly Available Hours: ${profile.weeklyAvailableHours} hours/week (Calibrate estimated milestone times realistically)
- Known Skill Gaps to Prioritize: ${identifiedGaps.length > 0 ? identifiedGaps.join(", ") : "General " + targetRole + " fundamentals"}
- Current Assessed Skills: ${skillStates.map((s: any) => `${s.skillName} (${Math.round(s.knowledgeScore)}%)`).join(", ") || "None"}

Generate exactly 5 progressive, dependency-aware milestones moving from foundational prerequisite skills to production readiness.
IMPORTANT: You MUST explicitly include each of the Known Skill Gaps (${identifiedGaps.length > 0 ? identifiedGaps.join(", ") : "core skills"}) in the "skillsCovered" array of the relevant milestones.
Format ONLY as valid JSON:
{
  "roadmapTitle": "${targetRole} Mastery Roadmap",
  "milestones": [
    {
      "title": "Milestone Title",
      "skillsCovered": ["Skill1", "Skill2"],
      "estimatedTime": "X weeks",
      "description": "Short description of learning objectives and deliverables",
      "whyItMatters": "Clear rationale connecting this milestone to production job expectations"
    }
  ]
}`;

  let parsed: z.infer<typeof RoadmapResponseSchema>;
  try {
    const aiResult = await ChatService.processJsonCompletion("You output strictly valid JSON only.", prompt);
    let content = aiResult.reply.trim();
    
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      content = content.slice(startIdx, endIdx + 1);
    }
    
    const rawJson = JSON.parse(content);
    parsed = RoadmapResponseSchema.parse(rawJson);
  } catch (error) {
    console.warn("AI roadmap generation failed or returned invalid format; utilizing deterministic fallback:", error);
    parsed = generateDeterministicRoadmap(
      targetRole,
      profile.experienceLevel,
      profile.weeklyAvailableHours || 10,
      identifiedGaps,
      canonicalSkills
    );
  }

  // Dynamic repair step for newly generated roadmaps: Ensure all identifiedGaps are covered in parsed.milestones
  for (const gap of identifiedGaps) {
    const isCovered = parsed.milestones.some((m: any) =>
      (m.skillsCovered || []).some((s: string) => isMatchingSkill(s, gap))
    );

    if (!isCovered) {
      const targetMilestone = parsed.milestones.find((m: any) => {
        const titleNorm = (m.title || "").toLowerCase();
        const descNorm = (m.description || "").toLowerCase();
        const gapNorm = gap.toLowerCase();
        return titleNorm.includes(gapNorm) || descNorm.includes(gapNorm);
      }) || parsed.milestones[1] || parsed.milestones[0];

      if (targetMilestone) {
        if (!targetMilestone.skillsCovered) {
          targetMilestone.skillsCovered = [];
        }
        if (!targetMilestone.skillsCovered.some((s: string) => isMatchingSkill(s, gap))) {
          targetMilestone.skillsCovered.push(gap);
        }
      }
    }
  }

  // Save to DB
  const roadmap = await prisma.roadmap.create({
    data: {
      userId,
      targetRole,
      status: "ACTIVE",
    },
  });

  const milestonesData = parsed.milestones.map((m: any, index: number) => ({
    roadmapId: roadmap.id,
    order: index + 1,
    title: m.title,
    description: m.description,
    status: index === 0 ? "current" : "upcoming",
    type: "LEARNING",
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
      description: `Generated new learning roadmap for ${profile.targetRole}`,
    },
  });

  const savedRoadmap = await prisma.roadmap.findUniqueOrThrow({
    where: { id: roadmap.id },
    include: {
      milestones: {
        orderBy: { order: "asc" },
      },
    },
  });

  return formatLearningPathResponse(savedRoadmap, profile.targetRole);
};

function formatLearningPathResponse(roadmap: any, targetRole: string) {
  const milestones = roadmap.milestones.map((m: any) => ({
    id: m.id,
    title: m.title,
    status: m.status.toLowerCase(), // completed, current, upcoming
    progress: m.status === "COMPLETED" ? 100 : m.status === "CURRENT" ? 15 : 0,
    skillsCovered: m.unlocks || [],
    estimatedTime: m.estimatedTime || "1 week",
    description: m.description || "",
    whyItMatters: m.why || "",
  }));

  const completed = milestones.filter((m: any) => m.status === "completed").length;
  const overallProgress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;
  
  const currentMilestone = milestones.find((m: any) => m.status === "current") || milestones[0];

  return {
    roadmapTitle: targetRole + " Mastery",
    targetRole,
    overallProgress,
    milestones,
    nextAction: currentMilestone ? {
      title: "Continue " + currentMilestone.title,
      href: "/dashboard"
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

  if (nextMilestone) {
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
  });

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

  // Fetch updated roadmap to return
  const updatedRoadmap = await prisma.roadmap.findUnique({
    where: { id: milestone.roadmapId },
    include: { milestones: { orderBy: { order: "asc" } } }
  });

  return formatLearningPathResponse(updatedRoadmap, updatedRoadmap!.targetRole);
};

