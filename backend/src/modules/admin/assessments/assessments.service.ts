import prisma from "../../../lib/prisma.js";

export const getAdminAssessments = async (skip: number, take: number, search?: string, status?: string, days?: number) => {
  const where: any = {};

  if (search) {
    where.user = { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }] };
  }

  if (status) {
    where.status = status;
  }

  if (days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    where.startedAt = { gte: startDate };
  }

  const [attempts, total, stats, completed, totalInterviews, completedInterviews, interviewStats] = await Promise.all([
    prisma.diagnosticAttempt.findMany({
      where,
      skip, take,
      orderBy: { startedAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.diagnosticAttempt.count({ where }),
    prisma.diagnosticAttempt.aggregate({
      where,
      _avg: { score: true },
    }),
    prisma.diagnosticAttempt.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.interviewSession.count(),
    prisma.interviewSession.count({ where: { status: 'COMPLETED' } }),
    prisma.interviewSession.aggregate({
      _avg: { score: true },
    }),
  ]);
  
  return {
    attempts,
    total,
    completed,
    averageScore: stats._avg.score || 0,
    interviewStats: {
      total: totalInterviews,
      completed: completedInterviews,
      averageScore: interviewStats._avg.score || 0,
    },
  };
};
