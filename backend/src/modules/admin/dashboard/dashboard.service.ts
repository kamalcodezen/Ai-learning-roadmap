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
    totalRoadmaps,
    activeRoadmaps,
    completedRoadmaps,
    totalAssessments,
    totalProjects,
    totalAiRequests,
    recentUsers,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "LEARNER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    
    prisma.roadmap.count(),
    prisma.roadmap.count({ where: { status: "ACTIVE" } }),
    prisma.roadmap.count({ where: { status: "COMPLETED" } }),
    
    prisma.diagnosticAttempt.count(),
    prisma.project.count(),
    prisma.aiUsageLog.count(),
    
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),

    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return {
    overview: {
      totalUsers,
      activeLearners: totalLearners,
      totalRoadmaps,
      totalAssessments,
      totalProjects,
      aiRequests: totalAiRequests,
    },
    userAnalytics: {
      totalUsers,
      learners: totalLearners,
      admins: totalAdmins,
      newUsers: recentUsers.length,
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
