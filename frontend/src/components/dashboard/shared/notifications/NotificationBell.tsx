"use client";

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

import {
  Bell,
  CheckCheck,
  Loader2,
  AlertCircle,
  Inbox,
  Award,
  BookOpen,
  Briefcase,
  MessageSquare,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useNotifications } from "@/src/hooks/useNotifications";

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getNotificationIcon(type: string) {
  switch (type?.toUpperCase()) {
    case "PROJECT":
      return <Briefcase className="size-4 text-blue-500" />;
    case "ASSESSMENT":
      return <BookOpen className="size-4 text-emerald-500" />;
    case "INTERVIEW":
      return <MessageSquare className="size-4 text-purple-500" />;
    case "MILESTONE":
      return <Award className="size-4 text-amber-500" />;
    case "ACHIEVEMENT":
      return <Sparkles className="size-4 text-yellow-500" />;
    default:
      return <Bell className="size-4 text-primary" />;
  }
}

export default function NotificationBell({ className }: { className?: string } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const mounted = useIsClient();
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    refetch,
    markAsRead,
    markAllAsRead,
    isMarkingAllRead,
    clearAll,
    isClearingAll,
    deleteNotification,
  } = useNotifications();

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;

    if (isMobile) {
      const topPos = Math.max(64, Math.min(rect.bottom + 8, window.innerHeight - 340));
      const maxH = window.innerHeight - topPos - 20;

      setDropdownStyle({
        position: "fixed",
        top: `${topPos}px`,
        left: "12px",
        right: "12px",
        width: "auto",
        maxWidth: "calc(100vw - 24px)",
        maxHeight: `${Math.max(280, maxH)}px`,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
      });
    } else {
      const panelWidth = 400;
      let left = rect.right - panelWidth;
      if (left < 16) left = 16;
      if (left + panelWidth > window.innerWidth - 16) {
        left = window.innerWidth - panelWidth - 16;
      }
      const topPos = rect.bottom + 8;
      const maxH = window.innerHeight - topPos - 24;

      setDropdownStyle({
        position: "fixed",
        top: `${topPos}px`,
        left: `${left}px`,
        width: `${panelWidth}px`,
        maxHeight: `${Math.max(340, maxH)}px`,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    window.addEventListener("resize", updatePosition);

    // Prevent recalculating position when user scrolls INSIDE the dropdown list
    const handleScroll = (event: Event) => {
      if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
        return;
      }
      updatePosition();
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, updatePosition]);

  // Close on outside click / tap (works on both mouse & touch)
  useEffect(() => {
    function handlePointerDown(event: Event) {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("touchstart", handlePointerDown, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  return (
    <>
      {/* Prominent, Modern Bell Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        aria-expanded={isOpen}
        className={[
          "relative flex items-center justify-center size-9 sm:size-10 rounded-full text-foreground transition-all cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Bell className="size-5 sm:size-5.5 text-foreground/90 group-hover:text-foreground group-hover:rotate-12 transition-transform duration-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-black text-white shadow-sm ring-2 ring-background animate-in zoom-in-50 duration-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && mounted && createPortal(
        <>
          {/* Mobile backdrop for seamless outside-tap dismiss */}
          <div
            className="fixed inset-0 z-[99998] bg-black/25 backdrop-blur-2xs sm:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={dropdownRef}
            role="dialog"
            aria-label="Notification center"
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            style={dropdownStyle}
            className="rounded-2xl border border-border/90 bg-card/95 backdrop-blur-2xl p-3.5 sm:p-4 shadow-[0_16px_40px_rgba(0,0,0,0.22)] dark:bg-[#11091e]/95 dark:border-primary/25 dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                {unreadCount > 0 ? (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                    {unreadCount} new
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {notifications.length}
                  </span>
                )}
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllAsRead()}
                    disabled={isMarkingAllRead}
                    title="Mark all notifications as read"
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 px-1.5 py-0.5 rounded-md hover:bg-primary/10 cursor-pointer"
                  >
                    {isMarkingAllRead ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <CheckCheck className="size-3.5" />
                    )}
                    <span className="hidden xs:inline sm:inline">Mark read</span>
                  </button>
                )}

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => clearAll()}
                    disabled={isClearingAll}
                    title="Clear all notifications"
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 px-1.5 py-0.5 rounded-md hover:bg-destructive/10 cursor-pointer"
                  >
                    {isClearingAll ? (
                      <Loader2 className="size-3 animate-spin text-destructive" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    <span className="hidden xs:inline sm:inline">Clear all</span>
                  </button>
                )}

                {/* Mobile Close X Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors sm:hidden cursor-pointer ml-1"
                  aria-label="Close notifications"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Filter Pills (if notifications exist) */}
            {notifications.length > 0 && (
              <div className="flex items-center gap-1.5 pt-2.5 pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-lg px-2.5 py-1 font-medium transition-all cursor-pointer ${
                    filter === "all"
                      ? "bg-primary text-white shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("unread")}
                  className={`rounded-lg px-2.5 py-1 font-medium transition-all cursor-pointer ${
                    filter === "unread"
                      ? "bg-primary text-white shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>
            )}

            {/* Body: Scrollable notifications list (flex-1 ensures it fits any mobile viewport) */}
            <div
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              onWheel={(e) => e.stopPropagation()}
              className="mt-2.5 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-2 pr-1.5 touch-pan-y"
              style={{
                scrollbarWidth: "thin",
                overscrollBehavior: "contain",
              }}
            >
              {isLoading ? (
                <div className="space-y-2 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 p-2.5 rounded-xl bg-muted/30 animate-pulse">
                      <div className="size-8 rounded-lg bg-muted shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-3/4 rounded bg-muted" />
                        <div className="h-2.5 w-1/2 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                  <AlertCircle className="size-8 text-destructive mb-2 opacity-80" />
                  <p className="text-xs font-medium text-foreground">Failed to load notifications</p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-2 text-xs text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Try again
                  </button>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-muted/60 mb-2.5 border border-border/40 shadow-2xs">
                    <Inbox className="size-5 opacity-60 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {filter === "unread" ? "No unread notifications" : "All caught up!"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-[240px]">
                    {filter === "unread"
                      ? "You have reviewed all your alerts."
                      : "When you receive course, badge, or streak updates, they will show up here."}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) {
                        markAsRead(n.id);
                      }
                    }}
                    className={`group relative flex items-start gap-2.5 sm:gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                      n.isRead
                        ? "bg-transparent border-transparent hover:bg-muted/45"
                        : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                    }`}
                  >
                    {/* Category Icon */}
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border/80 shadow-2xs mt-0.5">
                      {getNotificationIcon(n.type)}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs truncate ${
                            n.isRead ? "font-medium text-foreground" : "font-semibold text-foreground"
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0 ml-1 font-medium">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>

                    {/* Actions & Read Status */}
                    <div className="flex items-center gap-1.5 shrink-0 self-center">
                      {/* Delete notification button */}
                      <button
                        type="button"
                        title="Remove notification"
                        aria-label="Remove notification"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>

                      {!n.isRead && (
                        <span
                          className="size-2 rounded-full bg-primary shrink-0"
                          aria-label="Unread"
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
