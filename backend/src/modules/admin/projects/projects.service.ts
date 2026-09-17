import prisma from "../../../lib/prisma.js";

export const getAdminProjects = async (skip: number, take: number, search?: string, days?: number) => {
  const where: any = {};
  if (search) {
    where.title = { contains: search, mode: 'insensitive' as const };
  }
  if (days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    where.createdAt = { gte: startDate };
  }
  
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where, skip, take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.project.count({ where }),
  ]);
  return { projects, total };
};

export const verifyProject = async (
  adminId: string,
  projectId: string,
  isVerified: boolean,
  score?: number
) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found.");

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      isVerified,
      ...(score !== undefined ? { score } : {}),
    },
    include: { user: { select: { name: true, email: true } } },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId,
      action: isVerified ? "PROJECT_VERIFIED" : "PROJECT_UNVERIFIED",
      targetId: projectId,
      details: {
        previousVerified: project.isVerified,
        newVerified: isVerified,
        projectTitle: project.title,
        score,
      },
    },
  });

  return updatedProject;
};

