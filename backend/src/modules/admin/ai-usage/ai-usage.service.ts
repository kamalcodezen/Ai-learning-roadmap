import prisma from "../../../lib/prisma.js";

export const getAdminAiUsage = async (skip: number, take: number) => {
  const [logs, total, successCount, failureCount] = await Promise.all([
    prisma.aiUsageLog.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.aiUsageLog.count(),
    prisma.aiUsageLog.count({ where: { status: 'SUCCESS' } }),
    prisma.aiUsageLog.count({ where: { status: 'FAILURE' } })
  ]);
  
  const providerStatsRaw = await prisma.aiUsageLog.groupBy({
    by: ['provider', 'status'],
    _count: { provider: true }
  });
  
  const providerStats = providerStatsRaw.reduce((acc: any, curr: any) => {
    if (!acc[curr.provider]) acc[curr.provider] = { provider: curr.provider, success: 0, failure: 0, total: 0 };
    if (curr.status === 'SUCCESS') acc[curr.provider].success += curr._count.provider;
    if (curr.status === 'FAILURE') acc[curr.provider].failure += curr._count.provider;
    acc[curr.provider].total += curr._count.provider;
    return acc;
  }, {});

  return { logs, total, successCount, failureCount, providerStats: Object.values(providerStats) };
};
