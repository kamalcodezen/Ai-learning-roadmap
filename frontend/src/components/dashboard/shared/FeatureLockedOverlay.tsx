"use client";

import React from "react";
import Link from "next/link";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { useDashboardSession } from "./sessionGuard/SessionGuard";
import BrandLoader from "@/src/components/shared/BrandLoader";

interface FeatureLockedOverlayProps {
  featureName: string;
  requiredPlan: "PLUS" | "PRO";
  description?: string;
  children: React.ReactNode;
}

export default function FeatureLockedOverlay({
  featureName,
  requiredPlan,
  description,
  children,
}: FeatureLockedOverlayProps) {
  const { data: session, isPending } = useDashboardSession();

  const user = session?.user as { role?: string; plan?: string } | undefined;
  const userRole = (user?.role || "LEARNER").toUpperCase();
  const userPlan = (user?.plan || "FREE").toUpperCase();
  const isAdmin = userRole === "ADMIN";

  // Check if feature is locked for current user
  const isLocked = Boolean(
    !isAdmin &&
      ((requiredPlan === "PLUS" && userPlan === "FREE") ||
        (requiredPlan === "PRO" && userPlan !== "PRO"))
  );

  if (isPending) {
    return <BrandLoader message="Loading feature..." />;
  }

  // If user has access (purchased or admin), render full interactive content
  if (!isLocked) {
    return <>{children}</>;
  }

  // Locked State: Top dynamic banner + Subtle overlay allowing scrolling but blocking clicks
  return (
    <div className="relative w-full flex flex-col pb-10 animate-in fade-in duration-300">
      {/* 1. Top Dynamic Banner */}
      <div className="mb-6 rounded-2xl border border-primary/35 bg-gradient-to-r from-primary/15 via-card to-primary/10 p-5 shadow-lg relative overflow-hidden">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-primary/15 blur-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/40 bg-primary/20 text-primary shadow-[0_0_18px_rgba(159,84,247,0.35)]">
              <Lock className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-foreground">
                  {featureName}
                </h2>
                <span className="rounded-full border border-primary/40 bg-primary/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  {requiredPlan} Plan Required
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground max-w-2xl leading-relaxed">
                {description ||
                  `This feature is exclusively available on the AI Pather ${requiredPlan} tier. Upgrade your plan to unlock interactive sessions and full capabilities.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:opacity-95 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <Sparkles className="size-3.5" />
              <span>Upgrade to {requiredPlan}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Feature Screen with Subtle Overlay */}
      <div className="relative w-full rounded-2xl overflow-hidden cursor-not-allowed">
        {/* The feature UI is rendered, visible, and scrollable, but clicks are disabled */}
        <div className="pointer-events-none select-none opacity-70 filter blur-[0.2px]">
          {children}
        </div>

        {/* Subtle glass sheen overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/30 rounded-2xl" />
      </div>

      {/* 3. Floating Bottom Preview Indicator */}
      <div className="sticky bottom-4 z-20 mt-6 flex justify-center pointer-events-auto">
        <div className="inline-flex items-center gap-3 rounded-full border border-primary/30 bg-card/90 backdrop-blur-md px-5 py-2.5 shadow-xl text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <Lock className="size-3.5 text-primary" />
            <span>Preview Mode</span>
          </span>
          <span className="hidden sm:inline text-muted-foreground/60">•</span>
          <span className="hidden sm:inline text-muted-foreground">
            Explore the interface freely. Upgrade to interact.
          </span>
          <Link
            href="/pricing"
            className="ml-1 inline-flex items-center gap-1 rounded-full bg-primary/20 hover:bg-primary/30 px-3 py-1 text-[11px] font-bold text-primary transition-colors"
          >
            Upgrade Now <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
