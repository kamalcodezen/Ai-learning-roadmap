import prisma from "../../../lib/prisma.js";

export const getAdminResumes = async (
  skip: number,
  take: number,
  search?: string,
  minScore?: number,
  days?: number
) => {
  const where: any = {};

  if (search) {
    where.OR = [
      { targetRole: { contains: search, mode: "insensitive" as const } },
      { fullName: { contains: search, mode: "insensitive" as const } },
      { email: { contains: search, mode: "insensitive" as const } },
      { user: { name: { contains: search, mode: "insensitive" as const } } },
    ];
  }

  if (minScore !== undefined) {
    where.atsScore = { gte: minScore };
  }

  if (days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    where.createdAt = { gte: startDate };
  }

  const [resumes, total, highAtsCount, avgStats] = await Promise.all([
    prisma.resume.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
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
      },
    }),
    prisma.resume.count({ where }),
    prisma.resume.count({ where: { ...where, atsScore: { gte: 80 } } }),
    prisma.resume.aggregate({
      where,
      _avg: { atsScore: true },
    }),
  ]);

  return {
    resumes,
    total,
    summary: {
      totalResumes: total,
      averageAtsScore: Math.round(avgStats._avg.atsScore || 0),
      highAtsCount,
    },
  };
};

export const getAdminResumeDetails = async (resumeId: string) => {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
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
    },
  });

  if (!resume) {
    throw new Error("Resume not found.");
  }

  return resume;
};
