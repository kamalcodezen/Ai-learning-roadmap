import prisma from "../../../lib/prisma.js";
import { getSystemHealth } from "../system-health/system-health.service.js";

/**
 * Retrieves the comprehensive dashboard statistics for the admin overview.
 */
export const getDashboardStats = async () => {
  // Execute all independent queries concurrently for better performance
  const [
    totalUsers,
    totalLearners,
    totalAdmins,
    freeUsers,
    plusUsers,
    proUsers,
    totalRoadmaps,
    activeRoadmaps,
    completedRoadmaps,
    totalAssessments,
    totalProjects,
    totalInterviews,
    totalResumes,
    totalAiRequests,
    totalGemsResult,
    recentUsers,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "LEARNER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { plan: "FREE" } }),
    prisma.user.count({ where: { plan: "PLUS" } }),
    prisma.user.count({ where: { plan: "PRO" } }),
    
    prisma.roadmap.count(),
    prisma.roadmap.count({ where: { status: "ACTIVE" } }),
    prisma.roadmap.count({ where: { status: "COMPLETED" } }),
    
    prisma.diagnosticAttempt.count(),
    prisma.project.count(),
    prisma.interviewSession.count(),
    prisma.resume.count(),
    prisma.aiUsageLog.count(),
    prisma.userGamification.aggregate({
      _sum: { gemsBalance: true },
    }),
    
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        plan: true,
        createdAt: true,
        careerProfile: {
          select: {
            targetRole: true,
            targetRoleName: true,
          },
        },
      },
    }),

    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true, image: true } } },
    }),
  ]);

  return {
    overview: {
      totalUsers,
      activeLearners: totalLearners,
      totalRoadmaps,
      totalAssessments,
      totalProjects,
      totalInterviews,
      totalResumes,
      aiRequests: totalAiRequests,
      totalGemsInCirculation: totalGemsResult._sum.gemsBalance || 0,
    },
    userAnalytics: {
      totalUsers,
      learners: totalLearners,
      admins: totalAdmins,
      newUsers: recentUsers.length,
      freeUsers,
      plusUsers,
      proUsers,
    },
    roadmapManagement: {
      totalRoadmaps,
      active: activeRoadmaps,
      completed: completedRoadmaps,
    },
    systemHealth: await getSystemHealth(),
    recentUsers,
    recentActivity,
  };
};
