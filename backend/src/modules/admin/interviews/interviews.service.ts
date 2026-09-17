import prisma from "../../../lib/prisma.js";

export const getAdminInterviews = async (
  skip: number,
  take: number,
  search?: string,
  status?: string,
  days?: number
) => {
  const where: any = {};

  if (search) {
    where.OR = [
      { targetRole: { contains: search, mode: "insensitive" as const } },
      { user: { name: { contains: search, mode: "insensitive" as const } } },
      { user: { email: { contains: search, mode: "insensitive" as const } } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    where.startedAt = { gte: startDate };
  }

  const [interviews, total, completedCount, inProgressCount, avgStats] = await Promise.all([
    prisma.interviewSession.findMany({
      where,
      skip,
      take,
      orderBy: { startedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            plan: true,
          },
        },
        _count: {
          select: {
            questions: true,
            answers: true,
          },
        },
      },
    }),
    prisma.interviewSession.count({ where }),
    prisma.interviewSession.count({ where: { ...where, status: "COMPLETED" } }),
    prisma.interviewSession.count({ where: { ...where, status: "IN_PROGRESS" } }),
    prisma.interviewSession.aggregate({
      where: { ...where, status: "COMPLETED" },
      _avg: { score: true },
    }),
  ]);

  return {
    interviews,
    total,
    summary: {
      totalSessions: total,
      completedSessions: completedCount,
      inProgressSessions: inProgressCount,
      averageScore: Math.round(avgStats._avg.score || 0),
    },
  };
};

export const getAdminInterviewDetails = async (sessionId: string) => {
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          plan: true,
        },
      },
      questions: {
        orderBy: { order: "asc" },
      },
      answers: {
        include: {
          question: true,
        },
      },
    },
  });

  if (!session) {
    throw new Error("Interview session not found.");
  }

  return session;
};
