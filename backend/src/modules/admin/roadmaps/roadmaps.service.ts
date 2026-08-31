import prisma from "../../../lib/prisma.js";

export const getAdminRoadmaps = async (skip: number, take: number, search?: string, status?: string, targetRole?: string) => {
  const where: any = {};
  
  if (search) {
    where.user = { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }] };
  }

  if (status) {
    where.status = status;
  }

  if (targetRole) {
    where.targetRole = { contains: targetRole, mode: 'insensitive' as const };
  }

  const [roadmaps, total] = await Promise.all([
    prisma.roadmap.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, milestones: { select: { status: true } } },
    }),
    prisma.roadmap.count({ where }),
  ]);
  return { roadmaps, total };
};
