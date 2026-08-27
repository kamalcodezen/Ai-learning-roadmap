import prisma from "../../../lib/prisma.js";
import { ChatService } from "../../chat/services/chat.service.js";
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


export const getOrGenerateLearningPath = async (userId: string) => {
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("Career profile not found.");
  }

  const existingRoadmap = await prisma.roadmap.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      targetRole: profile.targetRole,
    },
    include: {
      milestones: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (existingRoadmap && existingRoadmap.milestones.length > 0) {
    return formatLearningPathResponse(existingRoadmap, profile.targetRole);
  }

  // If no roadmap exists for current role, invalidate older ones
  await prisma.roadmap.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "ARCHIVED" },
  });

  // Fetch context for AI
  const skillStates = await prisma.skillState.findMany({
    where: { userId },
  });

  const prompt = `
You are an expert AI Career Mentor. Generate a strictly JSON personalized learning roadmap for a user.
- Target Role: ${profile.targetRole}
- Experience Level: ${profile.experienceLevel}
- Weekly Available Hours: ${profile.weeklyAvailableHours} hours/week (Adjust the workload and estimated time realistically based on this availability)

Current Skills: ${skillStates.map((s: any) => s.skillName).join(", ") || "None"}

Generate 5 progressive milestones.
Format ONLY as valid JSON:
{
  "roadmapTitle": "Title of the roadmap",
  "milestones": [
    {
      "title": "Milestone Title",
      "skillsCovered": ["Skill1", "Skill2"],
      "estimatedTime": "X weeks",
      "description": "Short description",
      "whyItMatters": "Why this is important"
    }
  ]
}`;

  const aiResult = await ChatService.processJsonCompletion("You output strictly valid JSON only.", prompt);
  let content = aiResult.reply;
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) content = jsonMatch[0];
  
  let parsed;
  try {
    const rawJson = JSON.parse(content);
    parsed = RoadmapResponseSchema.parse(rawJson);
  } catch (error) {
    console.error("AI generated invalid roadmap format:", error);
    throw new Error("AI generated invalid roadmap format.");
  }

  // Save to DB
  const roadmap = await prisma.roadmap.create({
    data: {
      userId,
      targetRole: profile.targetRole,
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
