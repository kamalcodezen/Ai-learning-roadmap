import prisma from "../../../../lib/prisma.js";

export interface CreateNotificationInput {
  userId: string;
  type: "SYSTEM" | "PROJECT" | "ASSESSMENT" | "INTERVIEW" | "MILESTONE" | "ACHIEVEMENT" | string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export const createNotification = async (input: CreateNotificationInput) => {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
    },
  });
};

export const getNotifications = async (userId: string, limit = 20, offset = 0) => {
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const safeOffset = Math.max(0, offset);

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: safeLimit,
      skip: safeOffset,
    }),
    prisma.notification.count({
      where: { userId },
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    limit: safeLimit,
    offset: safeOffset,
  };
};

export const getUnreadCount = async (userId: string) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return { unreadCount: count };
};

export const markAsRead = async (userId: string, notificationId: string) => {
  const existing = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!existing || existing.userId !== userId) {
    throw new Error("Notification not found");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return { updatedCount: result.count };
};
