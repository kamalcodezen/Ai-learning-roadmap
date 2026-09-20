"use client";

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGemWallet,
  claimDailyGems,
  type GemWalletSummary,
} from "@/src/lib/api/learner/gem-economy";
import { useDashboardSession } from "./sessionGuard/SessionGuard";
import { Check, Clock, X, Flame } from "lucide-react";
import confetti from "canvas-confetti";

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Custom SVG matching the exact faceted Emerald Green Gem from user's design reference.
 */
export function EmeraldGemIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Top Center Table Facet (Bright lime/mint highlight) */}
      <polygon points="7,4 17,4 14,9.5 10,9.5" fill="#86efac" />

      {/* Top Left Facet (Light emerald) */}
      <polygon points="2.5,9 7,4 10,9.5" fill="#4ade80" />

      {/* Top Right Facet (Light emerald) */}
      <polygon points="17,4 21.5,9 14,9.5" fill="#4ade80" />

      {/* Center Lower Triangle to Point (Rich deep emerald) */}
      <polygon points="10,9.5 14,9.5 12,21" fill="#16a34a" />

      {/* Lower Left Pavilion (Medium vibrant emerald) */}
      <polygon points="2.5,9 10,9.5 12,21" fill="#22c55e" />

      {/* Lower Right Pavilion (Deep shade emerald) */}
      <polygon points="21.5,9 14,9.5 12,21" fill="#15803d" />

      {/* Top Reflection Shimmer Line */}
      <polygon points="8,4.5 16,4.5 15,6 9,6" fill="#bbf7d0" opacity="0.7" />

      {/* Crisp Polygonal Outline */}
      <polygon
        points="7,4 17,4 21.5,9 12,21 2.5,9"
        stroke="#14532d"
        strokeWidth="0.8"
        strokeLinejoin="round"
        fill="none"
        opacity="0.35"
      />
    </svg>
  );
}

export default function GemWalletPill({ className = "" }: { className?: string }) {
  const { data: session } = useDashboardSession();
  const userId = session?.user?.id;
  const userRole = ((session?.user as { role?: string })?.role || "").toUpperCase();
  const isAdmin = userRole === "ADMIN";

  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useIsClient();
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: wallet, isLoading, refetch } = useQuery<GemWalletSummary>({
    queryKey: ["gemWallet"],
    queryFn: () => getGemWallet(),
    enabled: !!userId && !isAdmin,
    staleTime: 0,
    refetchInterval: isAdmin ? false : 3000,
    refetchOnWindowFocus: !isAdmin,
  });

  // Listen for custom real-time sync broadcast events
  useEffect(() => {
    const handleSync = () => {
      refetch();
    };
    window.addEventListener("gems-updated", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("gems-updated", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, [refetch]);

  const claimMutation = useMutation({
    mutationFn: () => claimDailyGems(),
    onSuccess: () => {
      // Trigger festive confetti burst on claim
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.2 },
          colors: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
        });
      } catch {
        // Fallback gracefully
      }

      // Live invalidate and refetch queries for instant sync across application
      queryClient.invalidateQueries({ queryKey: ["gemWallet"] });
      queryClient.refetchQueries({ queryKey: ["gemWallet"] });
      queryClient.invalidateQueries({ queryKey: ["gemHistory"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.refetchQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
      queryClient.refetchQueries({ queryKey: ["unreadNotificationCount"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      refetch();
    },
  });

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
      const panelWidth = 380;
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

    // Prevent recalculating position when user scrolls INSIDE the modal
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

  // Close dropdown on outside click or mobile tap
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

  if (!userId || isAdmin) return null;

  const gemsCount = wallet?.gemsBalance ?? 0;
  const streak = wallet?.streak;
  const canClaim = streak && !streak.todayClaimed;

  return (
    <div className={`relative ${className}`}>
      {/* Live Badge Pill in Header — Compact background with prominent emerald gem and bold count */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-7.5 sm:h-8 px-2.5 sm:px-3 rounded-full border border-slate-700/70 dark:border-slate-500/80 bg-[#eefbf3] hover:bg-[#e2f8eb] transition-all shadow-[0_2px_8px_rgba(16,185,129,0.15)] cursor-pointer select-none group outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        title="View AI Gems balance & daily streak rewards"
      >
        <EmeraldGemIcon className="w-5.5 h-5.5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform shrink-0" />
        <span className="text-[#0f172a] font-black text-base sm:text-lg tracking-tight leading-none">
          {isLoading ? "..." : gemsCount}
        </span>
        {canClaim && (
          <span className="flex h-2 w-2 relative ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        )}
      </button>

      {/* 100% Mobile Responsive Dropdown Popover (Portaled to document.body) */}
      {isOpen && mounted && createPortal(
        <>
          {/* Mobile backdrop for seamless 1-tap outside dismiss */}
          <div
            className="fixed inset-0 z-[99998] bg-black/25 backdrop-blur-2xs sm:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={dropdownRef}
            role="dialog"
            aria-label="AI Gems Wallet"
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            style={dropdownStyle}
            className="rounded-2xl border border-border/90 bg-card/95 backdrop-blur-2xl p-3.5 sm:p-4 shadow-[0_16px_40px_rgba(0,0,0,0.22)] dark:bg-[#11091e]/95 dark:border-primary/25 dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-150 text-foreground"
          >
            {/* Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <EmeraldGemIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    AI Gems Wallet
                  </h4>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-foreground">{gemsCount}</span>
                    <span className="text-xs font-bold text-emerald-500">Gems</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                aria-label="Close gems wallet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body — flex-1 ensures it fits perfectly on any mobile height */}
            <div
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              onWheel={(e) => e.stopPropagation()}
              className="mt-3 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-3.5 pr-1 touch-pan-y"
              style={{
                scrollbarWidth: "thin",
                overscrollBehavior: "contain",
              }}
            >
              {/* 7-Day Streak Tracker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>7-Day Streak Ladder</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Day {streak?.currentStreakDays || 0} of 7
                  </span>
                </div>

                {/* Streak Day Dots */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-1">
                  {streak?.streakLadder.map((dayItem) => (
                    <div
                      key={dayItem.day}
                      className={`flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl border text-[10px] font-bold transition-all ${
                        dayItem.claimed
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : dayItem.isCurrent && canClaim
                          ? "bg-muted border-emerald-500 text-foreground ring-1 ring-emerald-500/40 animate-pulse"
                          : "bg-muted/40 text-muted-foreground border-border/40"
                      }`}
                    >
                      <span className="text-[9px] opacity-70">D{dayItem.day}</span>
                      <span className="mt-0.5 text-xs leading-none flex items-center gap-0.5">
                        {dayItem.claimed ? (
                          "✓"
                        ) : (
                          <>
                            +{dayItem.gems}
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button: Claim Today's Gem */}
              <div>
                {canClaim ? (
                  <button
                    type="button"
                    disabled={claimMutation.isPending}
                    onClick={() => claimMutation.mutate()}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    <EmeraldGemIcon className="w-4 h-4" />
                    <span>
                      {claimMutation.isPending
                        ? "Claiming..."
                        : `Claim Today (+${streak?.todayRewardGems || 1} Gems)`}
                    </span>
                  </button>
                ) : (
                  <div className="w-full py-2 px-3 rounded-xl bg-muted/60 text-muted-foreground text-xs font-semibold flex items-center justify-center gap-2 border border-border/60">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Claimed for today! Next in ~24h</span>
                  </div>
                )}
              </div>

              {/* Recent Earnings History */}
              <div className="pt-2 border-t border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Recent Activity
                </p>
                {wallet?.recentTransactions && wallet.recentTransactions.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {wallet.recentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-muted/40 transition-colors"
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold text-foreground text-[11px] truncate">
                            {tx.description}
                          </p>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(tx.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 shrink-0 flex items-center gap-1">
                          +{tx.amount}
                          <EmeraldGemIcon className="w-3 h-3 inline" />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic py-1">
                    No recent transactions yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
