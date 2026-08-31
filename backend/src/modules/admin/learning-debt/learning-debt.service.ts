import prisma from "../../../lib/prisma.js";

export const getAdminLearningDebt = async () => {
  const skills = await prisma.skillState.findMany({
    where: {
      OR: [
        { knowledgeScore: { lt: 50 } },
        { practiceScore: { lt: 50 } },
      ]
    },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { knowledgeScore: 'asc' },
    take: 50,
  });

  return { debtRecords: skills };
};
