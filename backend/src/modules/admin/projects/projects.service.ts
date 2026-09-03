import prisma from "../../../lib/prisma.js";

export const getAdminProjects = async (skip: number, take: number, search?: string, days?: number) => {
  const where: any = {};
  if (search) {
    where.title = { contains: search, mode: 'insensitive' as const };
  }
  if (days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    where.createdAt = { gte: startDate };
  }
  
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where, skip, take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.project.count({ where }),
  ]);
  return { projects, total };
};
