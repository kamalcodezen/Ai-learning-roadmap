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

  const [attempts, total, stats] = await Promise.all([
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
  ]);
  const completed = await prisma.diagnosticAttempt.count({ where: { ...where, status: 'COMPLETED' } });
  
  return { attempts, total, completed, averageScore: stats._avg.score || 0 };
};
