import { serverFetch, serverMutation } from "../../core/server";

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: NotificationItem[];
    total: number;
    unreadCount: number;
    limit: number;
    offset: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

export const getNotifications = async (
  limit = 20,
  offset = 0
): Promise<NotificationsResponse> => {
  return await serverFetch(`/api/notifications?limit=${limit}&offset=${offset}`);
};

export const getUnreadNotificationCount = async (): Promise<UnreadCountResponse> => {
  return await serverFetch(`/api/notifications/unread-count`);
};

export const markNotificationAsRead = async (id: string) => {
  return await serverMutation(`/api/notifications/${id}/read`, undefined, "PATCH");
};

export const markAllNotificationsAsRead = async () => {
  return await serverMutation(`/api/notifications/read-all`, undefined, "PATCH");
};
