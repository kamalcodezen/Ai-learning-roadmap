"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
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
    staleTime: 1000 * 30, // 30 seconds
  });

  const unreadCountQuery = useQuery({
    queryKey: [...UNREAD_COUNT_QUERY_KEY, userId],
    queryFn: () => getUnreadNotificationCount(),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });

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
  };
}
