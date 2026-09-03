import prisma from "../../../lib/prisma.js";

export const getAdminSkillProof = async (skip: number, take: number, search?: string) => {
  const where = search ? { user: { OR: [{ name: { contains: search, mode: 'insensitive' as const } }] } } : {};
  const [proofs, total] = await Promise.all([
    prisma.skillState.findMany({
      where, skip, take,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { evidenceScore: 'desc' }
    }),
    prisma.skillState.count({ where }),
  ]);
  
  return { proofs, total };
};
