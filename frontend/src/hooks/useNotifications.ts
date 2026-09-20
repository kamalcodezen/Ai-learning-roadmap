"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  deleteNotification,
  type NotificationsResponse,
  type NotificationItem,
} from "@/src/lib/api/learner/notifications";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"];
export const UNREAD_COUNT_QUERY_KEY = ["unreadNotificationCount"];

export function useNotifications(limit = 20) {
  const { data: session } = useDashboardSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, userId, limit],
    queryFn: () => getNotifications(limit),
    enabled: !!userId,
    staleTime: 0,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  const unreadCountQuery = useQuery({
    queryKey: [...UNREAD_COUNT_QUERY_KEY, userId],
    queryFn: () => getUnreadNotificationCount(),
    enabled: !!userId,
    staleTime: 0,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  // Listen for real-time broadcast events
  useEffect(() => {
    const handleSync = () => {
      notificationsQuery.refetch();
      unreadCountQuery.refetch();
    };
    window.addEventListener("notifications-updated", handleSync);
    window.addEventListener("gems-updated", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("notifications-updated", handleSync);
      window.removeEventListener("gems-updated", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, [notificationsQuery, unreadCountQuery]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => clearAllNotifications(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });

      queryClient.setQueriesData<NotificationsResponse>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              notifications: [],
              total: 0,
              unreadCount: 0,
            },
          };
        }
      );

      queryClient.setQueriesData(
        { queryKey: UNREAD_COUNT_QUERY_KEY },
        { success: true, data: { unreadCount: 0 } }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });

      queryClient.setQueriesData<NotificationsResponse>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (old) => {
          if (!old?.data) return old;
          const currentList = old.data.notifications || [];
          const target = currentList.find((n: NotificationItem) => n.id === id);
          const wasUnread = target && !target.isRead;
          return {
            ...old,
            data: {
              ...old.data,
              notifications: currentList.filter((n: NotificationItem) => n.id !== id),
              total: Math.max(0, (old.data.total || 0) - 1),
              unreadCount: wasUnread
                ? Math.max(0, (old.data.unreadCount || 0) - 1)
                : old.data.unreadCount,
            },
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });


  return {
    notifications: notificationsQuery.data?.data?.notifications || [],
    total: notificationsQuery.data?.data?.total || 0,
    unreadCount:
      unreadCountQuery.data?.data?.unreadCount ??
      (notificationsQuery.data?.data?.unreadCount || 0),
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    refetch: notificationsQuery.refetch,
    markAsRead: markReadMutation.mutate,
    isMarkingRead: markReadMutation.isPending,
    markAllAsRead: markAllReadMutation.mutate,
    isMarkingAllRead: markAllReadMutation.isPending,
    clearAll: clearAllMutation.mutate,
    isClearingAll: clearAllMutation.isPending,
    deleteNotification: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
