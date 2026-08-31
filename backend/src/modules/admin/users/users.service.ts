import prisma from "../../../lib/prisma.js";

/**
 * Retrieves paginated list of users with search functionality.
 */
export const getUsers = async (skip: number, take: number, search?: string, role?: string, days?: number) => {
  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" as const } },
      { email: { contains: search, mode: "insensitive" as const } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    where.createdAt = { gte: startDate };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
};

/**
 * Updates a user's role. Prevents self-demotion and tracks the action in the audit log.
 */
export const updateUserRole = async (adminId: string, targetUserId: string, newRole: string) => {
  if (newRole !== "LEARNER" && newRole !== "ADMIN") {
    throw new Error("Invalid role specified.");
  }

  if (adminId === targetUserId && newRole !== "ADMIN") {
    throw new Error("You cannot demote your own account.");
  }

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw new Error("Target user not found.");

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId,
      action: "ROLE_CHANGED",
      targetId: targetUserId,
      details: { oldRole: user.role, newRole },
    },
  });

  return updatedUser;
};

/**
 * Safely deletes a user by ID using Prisma's cascade delete. Prevents self-deletion.
 */
export const deleteUser = async (adminId: string, targetUserId: string) => {
  if (adminId === targetUserId) {
    throw new Error("You cannot delete your own currently authenticated account.");
  }

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw new Error("Target user not found.");

  await prisma.user.delete({
    where: { id: targetUserId },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId,
      action: "USER_DELETED",
      targetId: targetUserId,
      details: { userEmail: user.email },
    },
  });

  return { success: true };
};
