import prisma from "../../../lib/prisma.js";
import { ChatService } from "../../chat/services/chat.service.js";

async function ensureRoadmapExists(userId: string, targetRole: string, experienceLevel: string, skillStates: { skillName: string; knowledgeScore: number }[]) {
  let roadmap = await prisma.roadmap.findFirst({
    where: { userId, status: "ACTIVE", targetRole },
    include: { milestones: { orderBy: { order: "asc" } } }
  });

  if (roadmap) return roadmap;

  // Archive any active roadmaps that don't match the current targetRole
  await prisma.roadmap.updateMany({
    where: { userId, status: "ACTIVE", targetRole: { not: targetRole } },
    data: { status: "ARCHIVED" }
  });

  try {
    const systemInstruction = `You are an expert career and learning path advisor. 
You are generating a JSON learning roadmap for a user whose target role is "${targetRole}" and experience level is "${experienceLevel}".
Current skill state knowledge:
${skillStates.map((s) => `- ${s.skillName}: ${s.knowledgeScore}/100`).join("\n")}

Respond ONLY with a valid JSON object matching this schema:
{
  "milestones": [
    {
      "title": "Milestone Name",
      "description": "Short description",
      "type": "LEARNING",
      "estimatedTime": "2 weeks",
      "why": "Why this matters",
      "unlocks": ["Skill A", "Skill B"]
    }
  ]
}
Generate 4 to 6 milestones tailored to their gaps.`;

    const result = await ChatService.processJsonCompletion(systemInstruction, "Generate my roadmap.");
    const parsed = JSON.parse(result.reply);

    if (parsed && Array.isArray(parsed.milestones) && parsed.milestones.length > 0) {
      roadmap = await prisma.roadmap.create({
        data: {
          userId,
          targetRole,
          status: "ACTIVE",
          milestones: {
            create: parsed.milestones.map((m: Record<string, any>, idx: number) => ({
              order: idx + 1,
              title: m.title || "Untitled Milestone",
              description: m.description || "",
              status: idx === 0 ? "CURRENT" : "UPCOMING",
              type: m.type || "LEARNING",
              estimatedTime: m.estimatedTime || "1 week",
              why: m.why || "",
              unlocks: m.unlocks || [],
            }))
          }
        },
        include: { milestones: { orderBy: { order: "asc" } } }
      });

      // Record Activity Log
      await prisma.activityLog.create({
        data: {
          userId,
          type: "LEARNING",
          description: `Generated new learning roadmap for ${targetRole}`,
        },
      });

      return roadmap;
    }
  } catch (error) {
    console.error("Failed to generate roadmap:", error);
  }
  return null;
}


export const getDashboardOverview = async (userId: string) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // 1. Fetch user independent data first (Parallel)
  const [
    profile,
    skillStates,
    projects,
    activityLogs
  ] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.skillState.findMany({ 
      where: { userId },
      select: { skillName: true, knowledgeScore: true, practiceScore: true, evidenceScore: true }
    }),
    prisma.project.findMany({ where: { userId }, select: { score: true } }),
    prisma.activityLog.findMany({ where: { userId, createdAt: { gte: oneWeekAgo } }, select: { type: true } }),
  ]);

  const targetRole = profile?.targetRoleName || profile?.targetRole || "Unknown Role";
  const experienceLevel = profile?.experienceLevel || "BEGINNER";

  // 2. Fetch role-dependent data (Parallel)
  const [diagnosticResult, roadmap] = await Promise.all([
    prisma.diagnosticAttempt.findFirst({
      where: { userId, status: "COMPLETED", targetRole },
      orderBy: { completedAt: "desc" },
      select: { score: true }
    }),
    prisma.roadmap.findFirst({
      where: { userId, status: "ACTIVE", targetRole },
      include: { milestones: { orderBy: { order: "asc" }, select: { title: true, description: true, status: true } } }
    })
  ]);

  if (!roadmap) {
    // Fire off async generation without blocking the dashboard load
    ensureRoadmapExists(userId, targetRole, experienceLevel, skillStates).catch(console.error);
  }

  let totalScore = 0;
  if (skillStates.length > 0) {
    const knowledgeSum = skillStates.reduce((acc, s) => acc + s.knowledgeScore, 0);
    const practiceSum = skillStates.reduce((acc, s) => acc + s.practiceScore, 0);
    const projectSum = projects.reduce((acc, p) => acc + p.score, 0);
    
    const avgKnowledge = knowledgeSum / skillStates.length;
    const avgPractice = practiceSum / skillStates.length;
    const avgProject = projects.length > 0 ? projectSum / projects.length : 0;
    
    const divisor = projects.length > 0 ? 3 : 2;
    totalScore = Math.round((avgKnowledge + avgPractice + avgProject) / divisor);
  } else if (diagnosticResult?.score) {
    totalScore = diagnosticResult.score;
  }

  // Next action logic (Deterministic priority: Diagnostic -> Learning Debt -> Current Milestone)
  let nextAction = null;

  const criticalGaps = skillStates.filter((s) => s.knowledgeScore < 40);
  const missingEvidenceSkills = skillStates.filter((s) => s.knowledgeScore >= 70 && s.evidenceScore < 20);
  const currentMilestone = roadmap?.milestones.find((m) => m.status === "CURRENT") || roadmap?.milestones[0];

  if (!diagnosticResult) {
    nextAction = {
      title: "Take Initial Diagnostic",
      description: "Complete your first diagnostic test to establish your baseline.",
      reason: "Required to generate your personalized learning path.",
      actionLabel: "Start Diagnostic",
      href: "/diagnostic"
    };
  } else if (criticalGaps.length > 0) {
    const gap = criticalGaps[0]!;
    nextAction = {
      title: `Fix Critical Gap: ${gap.skillName}`,
      description: `Your knowledge score in ${gap.skillName} is critically low (${Math.round(gap.knowledgeScore)}%).`,
      reason: "Fixing fundamental gaps prevents compounding learning debt.",
      actionLabel: "Review Skill",
      href: "/skill-gaps"
    };
  } else if (currentMilestone) {
    nextAction = {
      title: `Continue ${currentMilestone.title}`,
      description: currentMilestone.description || "Continue your personalized learning path.",
      reason: "This is your current active roadmap milestone.",
      actionLabel: "Continue Path",
      href: "/learning-path"
    };
  } else if (missingEvidenceSkills.length > 0) {
    const skill = missingEvidenceSkills[0]!;
    nextAction = {
      title: `Build Project for ${skill.skillName}`,
      description: `You have strong knowledge in ${skill.skillName} but no portfolio evidence.`,
      reason: "Practical projects are required for career readiness.",
      actionLabel: "Add Project",
      href: "/portfolio"
    };
  } else if (totalScore < 50) {
    nextAction = {
      title: "Improve Career Readiness",
      description: "Your overall readiness score is below target.",
      reason: "Focus on closing skill and practice gaps.",
      actionLabel: "View Details",
      href: "/career-readiness"
    };
  } else {
    nextAction = {
      title: "Start Next Module",
      description: "You're on track! Continue to your next learning module.",
      reason: "No critical gaps identified.",
      actionLabel: "Continue",
      href: "/learning-path"
    };
  }

  // 1. Career Status
  const careerStatus = skillStates.some((s) => s.knowledgeScore < 40) ? "Needs Attention" : "You're on track";

  // 2. Readiness Calculations
  const averageKnowledge = skillStates.length ? Math.round(skillStates.reduce((a, s) => a + s.knowledgeScore, 0) / skillStates.length) : (diagnosticResult?.score || 0);
  const averagePractical = skillStates.length ? Math.round(skillStates.reduce((a, s) => a + s.practiceScore, 0) / skillStates.length) : null;
  const averageProjects = projects.length ? Math.round(projects.reduce((a, p) => a + p.score, 0) / projects.length) : null;
  const readiness = {
    score: totalScore,
    knowledge: averageKnowledge,
    practical: averagePractical,
    projects: averageProjects,
    problemSolving: null, // Hard to infer accurately without a specific assessment
    communication: null, // Hard to infer accurately
    interview: profile?.interviewScore || null,
    evidence: averageProjects,
  };

  // 3. Roadmap Details
  let roadmapDetails = null;
  if (roadmap) {
    const completedMilestones = roadmap.milestones.filter((m) => m.status === "COMPLETED").length;
    const progressPercent = roadmap.milestones.length ? Math.round((completedMilestones / roadmap.milestones.length) * 100) : 0;
    
    roadmapDetails = {
      currentMilestone: currentMilestone?.title || "Not started",
      progress: progressPercent,
      milestones: roadmap.milestones.map((m) => ({
        name: m.title,
        status: m.status === "CURRENT" ? "IN_PROGRESS" : m.status === "UPCOMING" ? "PENDING" : m.status
      })),
    };
  }

  // 4. Learning Debt
  const learningDebt = skillStates.reduce((acc: { skill: string; reason: string; severity: string; source: string }[], s) => {
    if (s.knowledgeScore < 40) {
      acc.push({ skill: s.skillName, reason: "Critical knowledge gap", severity: "HIGH", source: "Diagnostic" });
    } else if (s.practiceScore < 40 && s.knowledgeScore >= 50) {
      acc.push({ skill: s.skillName, reason: "Lacking practical application", severity: "MEDIUM", source: "Practice" });
    } else if (s.evidenceScore < 20 && s.practiceScore >= 50) {
      acc.push({ skill: s.skillName, reason: "Missing project evidence", severity: "LOW", source: "Portfolio" });
    } else if (s.knowledgeScore < 60) {
      acc.push({ skill: s.skillName, reason: "Needs review", severity: "MEDIUM", source: "Diagnostic" });
    }
    return acc;
  }, []).sort((a, b) => (a.severity === "HIGH" ? -1 : b.severity === "HIGH" ? 1 : 0)).slice(0, 3);

  // 5. Trending Skills (Optimized - No history lookup to save heavy query)
  const trendingSkills = [...skillStates].sort((a, b) => b.knowledgeScore - a.knowledgeScore).map((s) => {
    return {
      name: s.skillName,
      score: Math.round(s.knowledgeScore),
      trend: "FLAT" as const
    };
  }).slice(0, 4);

  // 6. Weekly Progress
  const weeklyProgress = {
    learning: activityLogs.filter(a => a.type === "LEARNING").length || null,
    assessments: activityLogs.filter(a => a.type === "ASSESSMENT").length || null,
    projects: activityLogs.filter(a => a.type === "PROJECT").length || null,
    practice: activityLogs.filter(a => a.type === "PRACTICE").length || null,
    careerReadiness: null, // Would need historical overall score comparison
  };

  // 7. Assessments (minimal summary)
  const pendingAssessments = (!diagnosticResult ? 1 : 0) + (currentMilestone ? 1 : 0);
  const assessmentsSummary = {
    pendingCount: pendingAssessments,
    completedCount: diagnosticResult ? 1 : 0,
  };

  // 8. Proof (minimal summary)
  const proofSummary = {
    trackedSkillsCount: skillStates.length,
  };

  // 9. Career Alignment (minimal summary)
  const careerAlignment = {
    target: targetRole,
    isAvailable: skillStates.length > 0,
  };

  // 10. Application Readiness (minimal summary)
  const applicationReadiness = {
    isAvailable: skillStates.length > 0 && projects.length > 0,
  };

  // 11. Portfolio (minimal summary)
  const portfolioStats = {
    projectCount: projects.length,
  };

  // Build the unified DashboardData structure exactly as the frontend expects
  return {
    user: {
      name: "User", // Will be overridden by session in frontend
      image: null,
    },
    career: {
      targetRole,
      experienceLevel,
      status: careerStatus,
    },
    readiness,
    nextAction,
    roadmap: roadmapDetails,
    learningDebt,
    skills: trendingSkills,
    weeklyProgress,
    assessments: assessmentsSummary,
    proof: proofSummary,
    careerAlignment,
    applicationReadiness,
    portfolio: portfolioStats,
  };
};




