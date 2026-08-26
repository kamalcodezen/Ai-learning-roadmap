import prisma from "../../../lib/prisma.js";
import { ChatService } from "../../chat/chat.service.js";

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
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  const targetRole = profile?.targetRoleName || profile?.targetRole || "Unknown Role";
  const experienceLevel = profile?.experienceLevel || "BEGINNER";

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [
    skillStates,
    diagnosticResult,
    roadmap,
    _recentAssessmentsCount,
    _recentLearningCount,
    projects,
    activityLogs,
    skillStateHistories
  ] = await Promise.all([
    prisma.skillState.findMany({ where: { userId } }),
    prisma.diagnosticAttempt.findFirst({
      where: { userId, status: "COMPLETED", targetRole },
      orderBy: { completedAt: "desc" }
    }),
    prisma.roadmap.findFirst({
      where: { userId, status: "ACTIVE", targetRole },
      include: { milestones: { orderBy: { order: "asc" } } }
    }),
    prisma.diagnosticAttempt.count({
      where: { userId, status: "COMPLETED", completedAt: { gte: oneWeekAgo } }
    }),
    prisma.skillState.count({
      where: { userId, lastReviewed: { gte: oneWeekAgo } }
    }),
    prisma.project.findMany({ where: { userId } }),
    prisma.activityLog.findMany({ where: { userId, createdAt: { gte: oneWeekAgo } } }),
    prisma.skillStateHistory.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'desc' }
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
      href: "/onboarding/diagnostic"
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

  // 5. Trending Skills
  const trendingSkills = [...skillStates].sort((a, b) => b.knowledgeScore - a.knowledgeScore).map((s) => {
    const history = skillStateHistories.find(h => h.skillName === s.skillName);
    let trend = "FLAT";
    if (history) {
      if (s.knowledgeScore > history.knowledgeScore) trend = "UP";
      else if (s.knowledgeScore < history.knowledgeScore) trend = "DOWN";
    } else {
      trend = "NEW";
    }
    return {
      name: s.skillName,
      score: Math.round(s.knowledgeScore),
      trend
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

  // 7. Assessments
  const assessmentsList = [];
  if (diagnosticResult) {
    assessmentsList.push({ name: "Initial Diagnostic", status: "COMPLETED", score: diagnosticResult.score });
  } else {
    assessmentsList.push({ name: "Initial Diagnostic", status: "NOT_STARTED", score: null });
  }
  if (currentMilestone) {
    assessmentsList.push({ name: `${currentMilestone.title} Exam`, status: "NOT_STARTED", score: null });
  }
  const weakSkill = skillStates.find((s) => s.knowledgeScore < 50);
  if (weakSkill) {
    assessmentsList.push({ name: `${weakSkill.skillName} Quiz`, status: "NOT_STARTED", score: null });
  }
  const recentAssessments = assessmentsList.slice(0, 3);

  // 8. Proof
  let proofDetails = {
    skillName: "Your Skills",
    knowledge: "PENDING",
    practice: "PENDING",
    evidence: "PENDING",
  };
  const topSkill = skillStates.length > 0 ? skillStates.reduce((prev, current) => (prev.knowledgeScore > current.knowledgeScore) ? prev : current) : null;
  if (topSkill) {
    proofDetails = {
      skillName: topSkill.skillName,
      knowledge: topSkill.knowledgeScore >= 80 ? "COMPLETED" : "PENDING",
      practice: topSkill.practiceScore >= 80 ? "COMPLETED" : "PENDING",
      evidence: topSkill.evidenceScore >= 80 ? "COMPLETED" : (topSkill.practiceScore >= 80 ? "WARNING" : "PENDING"),
    };
  }

  // 9. Career Alignment
  const strongSkills = [...skillStates]
    .filter((s) => s.knowledgeScore >= 70 && s.practiceScore >= 50)
    .sort((a, b) => (b.knowledgeScore + b.practiceScore) - (a.knowledgeScore + a.practiceScore))
    .slice(0, 3)
    .map((s) => s.skillName);
  
  const needsAttentionSkills = [...skillStates]
    .filter((s) => s.knowledgeScore < 60 || s.practiceScore < 40)
    .sort((a, b) => (a.knowledgeScore + a.practiceScore) - (b.knowledgeScore + b.practiceScore))
    .slice(0, 3)
    .map((s) => s.skillName);

  const careerAlignment = {
    target: targetRole,
    fitScore: totalScore,
    strong: strongSkills,
    needsAttention: needsAttentionSkills,
  };

  // 10. Application Readiness
  const applicationTechnical = skillStates.length ? Math.round(skillStates.reduce((a, s) => a + (s.knowledgeScore + s.practiceScore) / 2, 0) / skillStates.length) : null;
  const applicationPortfolio = projects.length > 0 ? Math.min(100, projects.length * 20) : null;
  
  const applicationReadiness = {
    technical: applicationTechnical,
    projects: averageProjects,
    portfolio: applicationPortfolio,
    interview: profile?.interviewScore || null,
    resume: profile?.resumeScore || null,
  };

  // 11. Portfolio
  const portfolioStats = {
    score: averageProjects,
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
    assessments: recentAssessments,
    proof: proofDetails,
    careerAlignment,
    applicationReadiness,
    portfolio: portfolioStats,
  };
};

export const getCareerTwin = async (userId: string) => {
  const profile = await prisma.careerProfile.findUnique({ where: { userId } });
  const skillStates = await prisma.skillState.findMany({ where: { userId } });
  
  const avgKnowledge = skillStates.length ? skillStates.reduce((a, s) => a + s.knowledgeScore, 0) / skillStates.length : 0;
  const avgPractice = skillStates.length ? skillStates.reduce((a, s) => a + s.practiceScore, 0) / skillStates.length : 0;
  const avgProject = skillStates.length ? skillStates.reduce((a, s) => a + s.projectScore, 0) / skillStates.length : 0;
  const avgEvidence = skillStates.length ? skillStates.reduce((a, s) => a + s.evidenceScore, 0) / skillStates.length : 0;

  const totalScore = Math.round((avgKnowledge + avgPractice + avgProject + avgEvidence) / 4) || 0;

  // Determine strong and weak skills based on knowledgeScore
  const strongSkills = skillStates.filter(s => s.knowledgeScore > 70).map(s => s.skillName).slice(0, 5);
  const weakSkills = skillStates.filter(s => s.knowledgeScore < 40).map(s => s.skillName).slice(0, 5);

  return {
    targetRole: profile?.targetRole || "Unknown Role",
    experienceLevel: profile?.experienceLevel || "Beginner",
    readinessScore: totalScore,
    scores: {
      knowledge: Math.round(avgKnowledge),
      practical: Math.round(avgPractice),
      projects: Math.round(avgProject),
      evidence: Math.round(avgEvidence),
      interview: 0,
    },
    strongSkills: strongSkills.length > 0 ? strongSkills : ["No strong skills yet"],
    weakSkills: weakSkills.length > 0 ? weakSkills : ["No critical gaps"],
    currentFocus: weakSkills.length > 0 ? `Improve ${weakSkills[0]}` : "General Practice",
    careerGaps: weakSkills.length > 0 ? weakSkills.map(w => `Missing deep knowledge in ${w}`) : ["No major gaps detected"],
    recommendedAction: {
      title: "Continue Learning",
      description: "Keep working on your roadmap to improve your readiness.",
      actionLabel: "View Roadmap",
      href: "/learning-path"
    }
  };
};

export const getSkillGaps = async (userId: string) => {
  const skillStates = await prisma.skillState.findMany({ 
    where: { userId },
    orderBy: { knowledgeScore: 'asc' },
  });

  const totalSkills = skillStates.length || 1;
  const overallHealth = Math.round(skillStates.reduce((a, s) => a + s.knowledgeScore, 0) / totalSkills);
  
  const criticalGaps = skillStates.filter(s => s.knowledgeScore < 40).length;
  const moderateGaps = skillStates.filter(s => s.knowledgeScore >= 40 && s.knowledgeScore < 70).length;
  const strongSkills = skillStates.filter(s => s.knowledgeScore >= 70).length;

  const gaps = skillStates.filter(s => s.knowledgeScore < 70).map(s => {
    const severity = s.knowledgeScore < 40 ? "critical" : "moderate";
    return {
      id: s.id,
      skill: s.skillName,
      score: Math.round(s.knowledgeScore),
      severity: severity,
      reason: severity === "critical" ? "Critical lack of theoretical knowledge." : "Needs more practice.",
      evidence: `Latest diagnostic score: ${Math.round(s.knowledgeScore)}%`,
      relatedAssessment: "Frontend Diagnostic Assessment",
      recommendedAction: `Start ${s.skillName} Module`,
      href: "/learning-path"
    };
  });

  return {
    overallHealth,
    criticalGaps,
    moderateGaps,
    strongSkills,
    gaps
  };
};

export const getProgress = async (userId: string) => {
  // 1. Fetch real activities for the user
  const activities = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  // 2. We use 0 for metrics (study time, streak, readiness) that do not yet have a direct real data source in PostgreSQL.
  return {
    weeklyHours: 0,
    monthlyHours: 0,
    currentStreak: 0,
    readinessTrend: 0,
    recentActivity: activities.map(a => ({
      id: a.id,
      type: a.type.toLowerCase() === "learning" || a.type.toLowerCase() === "practice" ? "learning" : a.type.toLowerCase() === "assessment" ? "assessment" : "project",
      title: a.type.charAt(0).toUpperCase() + a.type.slice(1).toLowerCase() + " Activity",
      date: a.createdAt.toISOString().split("T")[0],
      description: a.description || "Activity recorded"
    }))
  };
};

export const getProofGraph = async (userId: string) => {
    const skillStates = await prisma.skillState.findMany({ where: { userId } });
    const profile = await prisma.careerProfile.findUnique({ where: { userId } });
    
    const totalScore = skillStates.length ? skillStates.reduce((a, s) => a + s.evidenceScore, 0) / skillStates.length : 0;
    
    const nodes: any[] = [];
    
    skillStates.forEach((s) => {
      nodes.push({
        id: `${s.id}-skill`,
        type: "skill",
        title: s.skillName,
        status: s.evidenceScore > 50 ? "verified" : "pending",
        description: `Core skill node for ${s.skillName}`
      });
      
      nodes.push({
        id: `${s.id}-knowledge`,
        type: "knowledge",
        title: `${s.skillName} Knowledge`,
        status: s.knowledgeScore > 70 ? "verified" : s.knowledgeScore > 0 ? "pending" : "missing",
        score: Math.round(s.knowledgeScore),
        description: `Theoretical understanding`
      });
  
      nodes.push({
        id: `${s.id}-practice`,
        type: "practice",
        title: `${s.skillName} Practice`,
        status: s.practiceScore > 70 ? "verified" : s.practiceScore > 0 ? "pending" : "missing",
        description: `Practical exercises`
      });
    });
  
    // Fallback if no skills exist yet
    if (nodes.length === 0) {
      nodes.push({
        id: "empty-state-node",
        type: "skill",
        title: "No Skills Yet",
        status: "missing",
        description: "Complete a diagnostic to build your proof graph."
      });
    }
  
    return {
      primarySkill: profile?.targetRole || "Software Engineering",
      overallProofScore: Math.round(totalScore),
      nodes: nodes
    };
  };

// Generic Empty States for missing features
export const getAssessments = async (userId: string) => {
  // 1. Fetch real diagnostic attempts from the database
  const attempts = await prisma.diagnosticAttempt.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
  });

  // 2. Count completed
  const completedCount = attempts.filter((a) => a.status === "COMPLETED").length;

  // 3. Calculate average score
  const completedScores = attempts
    .filter((a) => a.status === "COMPLETED" && a.score !== null)
    .map(a => a.score as number);
    
  const averageScore = completedScores.length > 0 
    ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
    : 0;

  // 4. Map attempts to AssessmentItems
  const assessments = attempts.map(a => ({
    id: a.id,
    title: a.targetRole ? `${a.targetRole} Diagnostic` : "Diagnostic Assessment",
    type: "diagnostic",
    status: a.status === "COMPLETED" ? "completed" : "in_progress",
    score: a.score || undefined,
    description: "Evaluation of your current skills.",
    href: "/onboarding/diagnostic"
  }));
  
  // 5. Add a placeholder if empty so the UI doesn't look broken
  if (assessments.length === 0) {
    assessments.push({
      id: "placeholder-1",
      title: "Initial Diagnostic Assessment",
      type: "diagnostic",
      status: "not_started",
      score: undefined,
      description: "Baseline evaluation of your current development skills.",
      href: "/onboarding/diagnostic"
    });
  }

  return {
    completedCount,
    averageScore,
    assessments
  };
};

export const getCareerAlignment = async (userId: string) => {
  // 1. Fetch user's career profile to get the real target role
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });
  const targetRole = profile?.targetRoleName || profile?.targetRole || "Unknown Role";

  // 2. Fetch user's current skills
  const skillStates = await prisma.skillState.findMany({
    where: { userId },
  });

  // 3. Calculate a real fit score based on existing skill knowledge
  // If the user has no skills yet, we return 0 rather than inventing a fake score.
  let currentFit = 0;
  if (skillStates.length > 0) {
    const totalKnowledge = skillStates.reduce((acc, s) => acc + s.knowledgeScore, 0);
    currentFit = Math.round(totalKnowledge / skillStates.length);
  }

  // 4. Identify strong skills and priority gaps based on real scores
  const strongSkills = skillStates
    .filter(s => s.knowledgeScore >= 70)
    .sort((a, b) => b.knowledgeScore - a.knowledgeScore)
    .map(s => s.skillName);

  const priorityGaps = skillStates
    .filter(s => s.knowledgeScore < 50)
    .sort((a, b) => a.knowledgeScore - b.knowledgeScore)
    .map(s => s.skillName);

  // 5. Determine missing skills from Roadmap if it exists
  // We check the unlocks array on the milestones to find required skills.
  const activeRoadmap = await prisma.roadmap.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { milestones: true },
  });

  const missingSkills: string[] = [];
  if (activeRoadmap) {
    // Collect all skills the roadmap intends to teach
    const roadmapSkills = new Set<string>();
    activeRoadmap.milestones.forEach(m => {
      m.unlocks.forEach(skill => roadmapSkills.add(skill));
    });

    // Check which ones the user hasn't started learning
    const knownSkillNames = new Set(skillStates.map(s => s.skillName));
    roadmapSkills.forEach(skill => {
      if (!knownSkillNames.has(skill)) {
        missingSkills.push(skill);
      }
    });
  }

    // 6. Generate requirements array based on actual data
    const requirements = skillStates.map(s => ({
      skill: s.skillName,
      importance: s.knowledgeScore > 70 ? "High" : s.knowledgeScore > 40 ? "Medium" : "Low",
      status: s.knowledgeScore > 70 ? "acquired" : s.knowledgeScore > 40 ? "learning" : "missing"
    }));
    
    // Fallback if empty
    if (requirements.length === 0) {
      requirements.push({
        skill: "Core Fundamentals",
        importance: "High",
        status: "missing"
      });
    }

    return {
      targetRole,
      matchPercentage: currentFit,
      strongSkills: strongSkills.length > 0 ? strongSkills : ["No strong skills yet"],
      missingSkills: priorityGaps.length > 0 ? priorityGaps : ["No critical gaps"],
      requirements: requirements,
      recommendations: [
        "Continue practicing to increase your match percentage.",
        "Focus on your priority gaps first."
      ],
      nextAction: "View Learning Path",
      href: "/learning-path"
    };
  };

export const getApplicationReadiness = async (userId: string) => {
  // 1. Fetch real career profile for interview/resume scores
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  // 2. Fetch real skill states for technical readiness
  const skillStates = await prisma.skillState.findMany({
    where: { userId },
  });

  // 3. Fetch real projects for portfolio readiness
  const projects = await prisma.project.findMany({
    where: { userId },
  });

  // 4. Calculate individual metrics deterministically
  let technical = null;
  if (skillStates.length > 0) {
    const totalTechnical = skillStates.reduce((acc, s) => acc + (s.knowledgeScore + s.practiceScore) / 2, 0);
    technical = Math.round(totalTechnical / skillStates.length);
  }

  let portfolio = null;
  if (projects.length > 0) {
    portfolio = Math.min(100, projects.length * 20); // Basic deterministic metric: 5 projects = 100%
  }

  // Use real database scores, or null if they haven't been assessed yet
  const interview = profile?.interviewScore || null;
  const resume = profile?.resumeScore || null;

  // 5. Calculate overall readiness ONLY if we have enough trustworthy data.
  // We need at least 2 valid metrics to give a meaningful overall score, avoiding fake/misleading percentages.
  let overallScore = null;

  const availableMetrics = [];
  if (technical !== null) availableMetrics.push(technical);
  if (portfolio !== null) availableMetrics.push(portfolio);
  if (interview !== null) availableMetrics.push(interview);
  if (resume !== null) availableMetrics.push(resume);

  // If we have at least 2 metrics, we provide an overall average
  if (availableMetrics.length >= 2) {
    const sum = availableMetrics.reduce((acc, val) => acc + val, 0);
    overallScore = Math.round(sum / availableMetrics.length);
  }

  const categories: any[] = [];
  
  categories.push({
    id: "tech-1",
    name: "Technical Knowledge",
    score: technical || 0,
    status: technical && technical > 70 ? "strong" : technical && technical > 40 ? "needs_improvement" : "missing",
    reason: technical ? "Based on diagnostic and practice scores" : "Take diagnostic to assess technical skills",
    recommendation: "Keep practicing skills on your roadmap"
  });

  categories.push({
    id: "port-1",
    name: "Portfolio Strength",
    score: portfolio || 0,
    status: portfolio && portfolio > 70 ? "strong" : portfolio && portfolio > 40 ? "needs_improvement" : "missing",
    reason: portfolio ? `You have ${projects.length} verified projects` : "No projects added yet",
    recommendation: "Build and add more projects"
  });

  categories.push({
    id: "int-1",
    name: "Interview Readiness",
    score: interview || 0,
    status: interview && interview > 70 ? "strong" : interview && interview > 40 ? "needs_improvement" : "missing",
    reason: interview ? "Based on mock interview performance" : "No mock interviews completed",
    recommendation: "Schedule a mock interview"
  });

  return {
    overallScore: overallScore || 0,
    isReady: overallScore ? overallScore >= 80 : false,
    categories
  };
};

export const getPortfolio = async (userId: string) => {
  // 1. Fetch real projects for this user
  const projects = await prisma.project.findMany({
    where: { userId },
  });

  const projectCount = projects.length;

  // 2. Calculate average technical depth using the real Project.score field
  let technicalDepth = 0;
  if (projectCount > 0) {
    const totalScore = projects.reduce((acc, p) => acc + p.score, 0);
    technicalDepth = Math.round(totalScore / projectCount);
  }

  return {
    overallStrength: technicalDepth,
    projects: projects.map(p => ({
      id: p.id,
      name: p.title || "Project",
      description: p.description || "No description provided.",
      techStack: ["Next.js", "React"], // Fallback since no techStack in Prisma
      githubUrl: p.repositoryUrl || undefined,
      liveDemoUrl: p.liveUrl || undefined,
      metrics: {
        technicalDepth: p.score,
        explanationQuality: p.score, // Fallback mapping since we don't track this yet
        evidence: "verified"
      }
    }))
  };
};
