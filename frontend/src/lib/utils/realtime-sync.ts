import type { QueryClient } from "@tanstack/react-query";

/**
 * Universal helper to trigger instant real-time sync for Gems & Notifications across the app
 */
export function triggerRealtimeSync(queryClient?: QueryClient) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("gems-updated"));
    window.dispatchEvent(new CustomEvent("notifications-updated"));
  }
  if (queryClient) {
    queryClient.invalidateQueries({ queryKey: ["gemWallet"] });
    queryClient.refetchQueries({ queryKey: ["gemWallet"] });
    queryClient.invalidateQueries({ queryKey: ["gemHistory"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.refetchQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    queryClient.refetchQueries({ queryKey: ["unreadNotificationCount"] });
  }
}
