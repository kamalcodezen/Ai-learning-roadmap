"use client";

import { Menu, Sparkles } from "lucide-react";
import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";
import { BorderBeam } from "@/src/components/ui/border-beam";
import { useDashboardSession } from "../sessionGuard/SessionGuard";
import NotificationBell from "../notifications/NotificationBell";
import GemWalletPill from "../GemWalletPill";

interface MobileSidebarToggleProps {
  onOpen: () => void;
}

export default function MobileSidebarToggle({ onOpen }: MobileSidebarToggleProps) {
  const { data: session } = useDashboardSession();
  const userRole = ((session?.user as { role?: string })?.role || "").toUpperCase();
  const isAdmin = userRole === "ADMIN";

  return (
    <header
      role="banner"
      className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl xl:left-64 xl:px-6 transition-all duration-200"
    >
      {/* Mobile Drawer Trigger */}
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open dashboard menu"
        aria-haspopup="dialog"
        className="flex size-10 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 xl:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      {/* Desktop Workspace Badge / Indicator */}
      <div className="hidden xl:flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          {isAdmin ? "Admin Console" : "AI Learning Workspace"}
        </div>
      </div>

      {/* Unified Action Controls (Identical on Desktop & Mobile) */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("open-ai-chat"));
            }
          }}
          aria-label="Open AI Mentor Chat"
          className="relative flex items-center gap-2 rounded-lg border border-foreground/20 px-2.5 py-1.5 font-semibold text-xs sm:text-sm text-primary transition-colors hover:bg-brand hover:text-white cursor-pointer"
        >
          <BorderBeam
            size={60}
            duration={6}
            colorFrom="rgba(239,68,68,0)"
            colorTo="#ef4444"
          />
          <BorderBeam
            size={60}
            duration={6}
            delay={3}
            borderWidth={2}
            colorFrom="rgba(59,130,246,0)"
            colorTo="#3b82f6"
          />
          <Sparkles className="size-4" aria-hidden="true" />
          <span className="mt-0.5">Ai Mentor</span>
        </button>

        {/* Gems Wallet Pill is only for students/learners, not for Admin */}
        {!isAdmin && <GemWalletPill />}

        <NotificationBell />

        <AnimatedThemeToggler className="hover:bg-foreground/10" />
      </div>
    </header>
  );
}
