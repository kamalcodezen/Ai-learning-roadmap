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
} from "lucide-react";
import { PiBellSimpleFill } from "react-icons/pi";
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

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
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
  } = useNotifications();

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;

    if (isMobile) {
      setDropdownStyle({
        position: "fixed",
        top: `${rect.bottom + 8}px`,
        left: "16px",
        right: "16px",
        maxWidth: "calc(100vw - 32px)",
        zIndex: 99999,
      });
    } else {
      const panelWidth = 384;
      let left = rect.left;
      if (left + panelWidth > window.innerWidth - 16) {
        left = window.innerWidth - panelWidth - 16;
      }
      if (left < 16) left = 16;

      setDropdownStyle({
        position: "fixed",
        top: `${rect.bottom + 8}px`,
        left: `${left}px`,
        width: `${panelWidth}px`,
        zIndex: 99999,
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        aria-expanded={isOpen}
        className="relative flex size-9 items-center justify-center rounded-lg text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/"
      >
        <PiBellSimpleFill className="size-5 text-foreground" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in-50 duration-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && mounted && createPortal(
        <div
          ref={dropdownRef}
          role="dialog"
          aria-label="Notification center"
          style={dropdownStyle}
          className="rounded-2xl border border-border bg-card/95 backdrop-blur-md p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllRead}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
              >
                {isMarkingAllRead ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <CheckCheck className="size-3.5" />
                )}
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {isLoading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 p-2 rounded-xl bg-muted/30 animate-pulse">
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
                  className="mt-2 text-xs text-primary font-semibold hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted/50 mb-2">
                  <Inbox className="size-5 opacity-60" />
                </div>
                <p className="text-xs font-medium text-foreground">No notifications yet</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Updates and progress alerts will appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) {
                      markAsRead(n.id);
                    }
                  }}
                  className={`group relative flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer border ${
                    n.isRead
                      ? "bg-transparent border-transparent hover:bg-muted/40"
                      : "bg-primary/5 border-primary/15 hover:bg-primary/10"
                  }`}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border/80 shadow-2xs mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs truncate ${
                          n.isRead ? "font-medium text-foreground" : "font-semibold text-foreground"
                        }`}
                      >
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>

                  {!n.isRead && (
                    <span
                      className="size-2 rounded-full bg-primary shrink-0 self-center"
                      aria-label="Unread"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
