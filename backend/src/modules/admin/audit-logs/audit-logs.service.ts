import prisma from "../../../lib/prisma.js";

export const getAuditLogs = async (skip: number, take: number) => {
  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { name: true, email: true } } },
    }),
    prisma.adminAuditLog.count(),
  ]);
  return { logs, total };
};
