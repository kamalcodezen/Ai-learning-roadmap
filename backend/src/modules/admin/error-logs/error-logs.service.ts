import prisma from "../../../lib/prisma.js";

/**
 * Queries system runtime error logs and exception records in chronological order.
 * @param skip Offset pagination starting index
 * @param take Number of error records to return
 */
export const getAdminErrorLogs = async (skip: number, take: number) => {
  const [errors, total] = await Promise.all([
    prisma.errorLog.findMany({
      skip, take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.errorLog.count(),
  ]);
  return { errors, total };
};
