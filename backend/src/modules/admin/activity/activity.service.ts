import prisma from "../../../lib/prisma.js";

export const getAdminActivity = async (skip: number, take: number) => {
  const [activities, total] = await Promise.all([
    prisma.activityLog.findMany({
      skip, take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.activityLog.count(),
  ]);
  return { activities, total };
};
