import prisma from "../../../../lib/prisma.js";
import { ChatService } from "../../copilot/services/chat.service.js";
import { getCareerReadiness } from "../../readiness/services/readiness.service.js";

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

  // 1. Fetch all dashboard data concurrently (Parallel)
  const [
    profile,
    skillStates,
    projects,
    activityLogs,
    diagnosticResult,
    roadmap
  ] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId } }),
    prisma.skillState.findMany({ 
      where: { userId },
      select: { skillName: true, knowledgeScore: true, practiceScore: true, evidenceScore: true }
    }),
    prisma.project.findMany({ where: { userId }, select: { score: true } }),
    prisma.activityLog.groupBy({
      by: ['type'],
      where: { userId, createdAt: { gte: oneWeekAgo } },
      _count: { _all: true }
    }),
    prisma.diagnosticAttempt.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      select: { 
        score: true,
        targetRole: true,
        answers: {
          where: { question: { order: { in: [4, 6] } } },
          include: { question: true }
        }
      }
    }),
    prisma.roadmap.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { 
        milestones: { orderBy: { order: "asc" }, select: { title: true, description: true, status: true } }
      }
    })
  ]);

  const targetRole = profile?.targetRoleName || profile?.targetRole || "Unknown Role";
  const experienceLevel = profile?.experienceLevel || "BEGINNER";
  
  // Ensure the fetched diagnostic and roadmap match the current target role
  const validDiagnosticResult = (diagnosticResult as any)?.targetRole === targetRole ? diagnosticResult : null;
  const validRoadmap = (roadmap as any)?.targetRole === targetRole ? roadmap : null;

  if (!validRoadmap) {
    // Fire off async generation without blocking the dashboard load
    ensureRoadmapExists(userId, targetRole, experienceLevel, skillStates).catch(console.error);
  }

  const readinessResult = await getCareerReadiness(userId, {
    profile,
    skillStates,
    projects,
    latestDiagnostic: validDiagnosticResult
  });
  
  const totalScore = readinessResult.score;

  // Next action logic (Deterministic priority: Diagnostic -> Learning Debt -> Current Milestone)
  let nextAction = null;

  const criticalGaps = skillStates.filter((s) => s.knowledgeScore < 40);
  const missingEvidenceSkills = skillStates.filter((s) => s.knowledgeScore >= 70 && s.evidenceScore < 20);
  const currentMilestone = validRoadmap?.milestones.find((m) => m.status === "CURRENT") || validRoadmap?.milestones[0];

  if (!validDiagnosticResult) {
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
      href: "/dashboard/learner/skill-gaps"
    };
  } else if (currentMilestone) {
    nextAction = {
      title: `Continue ${currentMilestone.title}`,
      description: currentMilestone.description || "Continue your personalized learning path.",
      reason: "This is your current active roadmap milestone.",
      actionLabel: "Continue Path",
      href: "/dashboard/learner/learning-path"
    };
  } else if (missingEvidenceSkills.length > 0) {
    const skill = missingEvidenceSkills[0]!;
    nextAction = {
      title: `Build Project for ${skill.skillName}`,
      description: `You have strong knowledge in ${skill.skillName} but no portfolio evidence.`,
      reason: "Practical projects are required for career readiness.",
      actionLabel: "Add Project",
      href: "/dashboard/learner/portfolio"
    };
  } else if (totalScore < 50) {
    nextAction = {
      title: "Improve Career Readiness",
      description: "Your overall readiness score is below target.",
      reason: "Focus on closing skill and practice gaps.",
      actionLabel: "View Details",
      href: "/dashboard/learner/career-twin"
    };
  } else {
    nextAction = {
      title: "Start Next Module",
      description: "You're on track! Continue to your next learning module.",
      reason: "No critical gaps identified.",
      actionLabel: "Continue",
      href: "/dashboard/learner/learning-path"
    };
  }

  // 1. Career Status
  const careerStatus = skillStates.some((s) => s.knowledgeScore < 40) ? "Needs Attention" : "You're on track";

  // 2. Readiness Calculations
  const readiness = {
    score: readinessResult.score,
    knowledge: readinessResult.scores.knowledge !== "NOT_ASSESSED" ? readinessResult.scores.knowledge : null,
    practical: readinessResult.scores.practical !== "NOT_ASSESSED" ? readinessResult.scores.practical : null,
    projects: readinessResult.scores.projects !== "NOT_ASSESSED" ? readinessResult.scores.projects : null,
    problemSolving: readinessResult.scores.problemSolving !== "NOT_ASSESSED" ? readinessResult.scores.problemSolving : null,
    communication: readinessResult.scores.communication !== "NOT_ASSESSED" ? readinessResult.scores.communication : null,
    interview: readinessResult.scores.interview !== "NOT_ASSESSED" ? readinessResult.scores.interview : null,
    evidence: readinessResult.scores.evidence !== "NOT_ASSESSED" ? readinessResult.scores.evidence : null,
  };

  // 3. Roadmap Details
  let roadmapDetails = null;
  if (validRoadmap) {
    const completedMilestones = validRoadmap.milestones.filter((m) => m.status === "COMPLETED").length;
    const progressPercent = validRoadmap.milestones.length ? Math.round((completedMilestones / validRoadmap.milestones.length) * 100) : 0;
    
    roadmapDetails = {
      currentMilestone: currentMilestone?.title || "Not started",
      progress: progressPercent,
      milestones: validRoadmap.milestones.map((m) => ({
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
    learning: activityLogs.find(a => a.type === "LEARNING")?._count._all || null,
    assessments: activityLogs.find(a => a.type === "ASSESSMENT")?._count._all || null,
    projects: activityLogs.find(a => a.type === "PROJECT")?._count._all || null,
    practice: activityLogs.find(a => a.type === "PRACTICE")?._count._all || null,
    careerReadiness: null, // Would need historical overall score comparison
  };

  // 7. Assessments (minimal summary)
  const pendingAssessments = (!validDiagnosticResult ? 1 : 0) + (currentMilestone ? 1 : 0);
  const assessmentsSummary = {
    pendingCount: pendingAssessments,
    completedCount: validDiagnosticResult ? 1 : 0,
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




