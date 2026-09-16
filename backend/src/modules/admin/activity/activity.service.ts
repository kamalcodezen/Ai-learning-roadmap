import prisma from "../../../lib/prisma.js";

/**
 * Queries paginated activity logs ordered by most recent first, with joined user details.
 * @param skip Offset pagination starting index
 * @param take Number of activity records to return
 */
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
