"use client";

import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { redirect } from "next/navigation";
import RoadmapSimulatorWidget from "./RoadmapSimulatorWidget";
import ZeroGuiltRecoveryBanner from "./ZeroGuiltRecoveryBanner";
import AiDependencyMeter from "./AiDependencyMeter";
import { Sliders, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdaptiveRecoveryPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  if (isSessionLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-10 w-64 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!session?.user?.id) {
    redirect("/signin");
  }

  return (
    <div className="flex flex-col dashboard-card-gap pb-12 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-border">
            <Sliders className="w-3.5 h-3.5" />
            <span>Adaptive Engine & Resilience</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Adaptive Pace & Recovery Engine
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Personalize your weekly study velocity, track autonomous problem-solving signals, and safely rebuild momentum whenever life interrupts your routine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/learner/learning-path"
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-all flex items-center gap-1.5 border border-border"
          >
            <span>View Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Feature 1: Roadmap Pace Simulator */}
      <div className="space-y-2">
        <RoadmapSimulatorWidget defaultExpanded={true} />
      </div>

      {/* Feature 2: Zero-Guilt Recovery Engine */}
      <div className="space-y-2">
        <ZeroGuiltRecoveryBanner allowAccordionPreview={true} defaultExpanded={true} />
      </div>

      {/* Feature 3: AI Dependency & Problem-Solving Meter */}
      <div className="space-y-2">
        <AiDependencyMeter defaultExpanded={true} />
      </div>
    </div>
  );
}
