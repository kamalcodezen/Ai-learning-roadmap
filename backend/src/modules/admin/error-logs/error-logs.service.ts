import prisma from "../../../lib/prisma.js";

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
