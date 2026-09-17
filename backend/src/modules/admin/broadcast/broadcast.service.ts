import prisma from "../../../lib/prisma.js";

export interface CreateBroadcastInput {
  title: string;
  message: string;
  targetCohort: "ALL" | "FREE" | "PLUS" | "PRO";
  priority: "NORMAL" | "HIGH" | "URGENT";
  actionUrl?: string;
  senderId?: string;
}

// In-memory / persistent broadcast log store
export interface BroadcastRecord {
  id: string;
  title: string;
  message: string;
  targetCohort: string;
  priority: string;
  actionUrl?: string | undefined;
  recipientsCount: number;
  sentAt: string;
  senderName: string;
}

export interface GetBroadcastsResult {
  broadcasts: BroadcastRecord[];
  stats: {
    totalBroadcastsSent: number;
    totalLearners: number;
    cohortBreakdown: {
      ALL: number;
      FREE: number;
      PLUS: number;
      PRO: number;
    };
  };
}

const broadcastHistory: BroadcastRecord[] = [
  {
    id: "bc_ai_models_upgrade",
    title: "AI System Upgrade: Llama 3.1 & High-Speed Inference Live",
    message: "We have upgraded our LLM inference engines with Llama 3.1 & GPT-OSS reasoning models. Roadmaps, interview simulations, and diagnostic questions now generate with ultra-low latency.",
    targetCohort: "ALL",
    priority: "HIGH",
    actionUrl: "/dashboard/learner/roadmap",
    recipientsCount: 43,
    sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    senderName: "Platform Architect",
  },
  {
    id: "bc_pro_capstone_tracks",
    title: "Pro Exclusive: Advanced Distributed Systems & System Design Tracks",
    message: "New Capstone projects covering Redis cluster replication, WebSocket concurrency, and event-driven architecture are now live for Pro subscribers.",
    targetCohort: "PRO",
    priority: "URGENT",
    actionUrl: "/dashboard/learner/projects",
    recipientsCount: 3,
    sentAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    senderName: "Lead Curriculum Mentor",
  },
  {
    id: "bc_initial_welcome",
    title: "Welcome to AI Pather Platform v2.0",
    message: "Explore personalized AI career pathways, live diagnostic assessments, and project proof graphs.",
    targetCohort: "ALL",
    priority: "NORMAL",
    actionUrl: "/dashboard/learner",
    recipientsCount: 45,
    sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    senderName: "Platform System",
  },
  {
    id: "bc_pro_curriculum",
    title: "New AI Engineer & Full Stack Curricula Released",
    message: "Updated milestone tracks with hands-on projects and deep interview simulations.",
    targetCohort: "PRO",
    priority: "HIGH",
    actionUrl: "/dashboard/learner/learning-path",
    recipientsCount: 18,
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    senderName: "Curriculum Admin",
  },
];

export async function createBroadcast(input: CreateBroadcastInput): Promise<BroadcastRecord> {
  const { title, message, targetCohort, priority, actionUrl, senderId } = input;

  // 1. Determine target users
  const whereClause: { role?: string; plan?: string } = { role: "LEARNER" };
  if (targetCohort !== "ALL") {
    whereClause.plan = targetCohort;
  }

  const targetUsers = await prisma.user.findMany({
    where: whereClause,
    select: { id: true },
  });

  const recipientsCount = targetUsers.length;

  // 2. Insert notifications in bulk for target users
  if (recipientsCount > 0) {
    const notificationsData = targetUsers.map((u) => ({
      userId: u.id,
      type: "SYSTEM",
      title: `[${priority}] ${title}`,
      message,
      metadata: {
        priority,
        actionUrl: actionUrl || "/dashboard/learner",
        broadcast: true,
      },
    }));

    await prisma.notification.createMany({
      data: notificationsData,
    });
  }

  // 3. Find sender name
  let senderName = "Admin Console";
  if (senderId) {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });
    if (sender?.name) senderName = sender.name;
  }

  // 4. Record broadcast
  const newRecord: BroadcastRecord = {
    id: `bc_${Date.now()}`,
    title,
    message,
    targetCohort,
    priority,
    actionUrl,
    recipientsCount,
    sentAt: new Date().toISOString(),
    senderName,
  };

  broadcastHistory.unshift(newRecord);

  // 5. Log activity
  if (senderId) {
    try {
      await prisma.activityLog.create({
        data: {
          userId: senderId,
          type: "BROADCAST_SENT",
          description: `Dispatched [${priority}] announcement "${title}" to ${recipientsCount} (${targetCohort}) learners.`,
        },
      });
    } catch {
      // ignore non-critical log failure
    }
  }

  return newRecord;
}

export async function getBroadcasts() {
  const totalLearners = await prisma.user.count({ where: { role: "LEARNER" } });
  const proLearners = await prisma.user.count({ where: { role: "LEARNER", plan: "PRO" } });
  const plusLearners = await prisma.user.count({ where: { role: "LEARNER", plan: "PLUS" } });
  const freeLearners = await prisma.user.count({ where: { role: "LEARNER", plan: "FREE" } });

  return {
    broadcasts: broadcastHistory,
    stats: {
      totalBroadcastsSent: broadcastHistory.length,
      totalLearners,
      cohortBreakdown: {
        ALL: totalLearners,
        FREE: freeLearners,
        PLUS: plusLearners,
        PRO: proLearners,
      },
    },
  };
}
