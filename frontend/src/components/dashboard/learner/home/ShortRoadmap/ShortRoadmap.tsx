"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Lenis from "lenis";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/Card";
import type { DashboardData } from "@/src/app/(dashboard)/dashboard/types";

interface Props {
  data: DashboardData["roadmap"];
}

export default function ShortRoadmap({ data }: Props) {
  const milestonesScrollRef = useRef<HTMLDivElement>(null);
  const milestonesContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (!milestonesScrollRef.current || !milestonesContentRef.current) return;

    const lenis = new Lenis({
      wrapper: milestonesScrollRef.current,
      content: milestonesContentRef.current,
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  if (!data) {
    return (
      <Card
        className="rounded-xl p-6 border-2 border-background shadow-none proof-card h-[365px]"
      >
        <CardHeader className="relative z-10 pb-2 shrink-0">
          <CardTitle>Your Roadmap</CardTitle>
        </CardHeader>

        <CardContent className="relative z-10">
          <p className="text-sm leading-relaxed text-muted-foreground">
            No roadmap generated yet. Complete your diagnostic to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="rounded-xl p-6 border-2 border-background shadow-none dashboard-card h-[365px]"
    >
      {/* ================================================================
          HEADER
      ================================================================= */}
      <CardHeader className="relative z-10 pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle
            className="
              text-xl
              font-bold
              tracking-tight
              text-foreground
            "
          >
            Your Roadmap
          </CardTitle>

          {/* Optional progress indicator */}
          <span
            className="
              rounded-full
              bg-primary/10
              px-2.5
              py-1
              text-[11px]
              font-semibold
              text-primary
            "
          >
            {data.progress}% Complete
          </span>
        </div>
      </CardHeader>

      {/* ================================================================
          CONTENT
      ================================================================= */}
      <CardContent className="relative z-10 flex min-h-0 flex-col">
        <div ref={milestonesScrollRef} className="min-h-0 flex-1 overflow-y-scroll">
        <div ref={milestonesContentRef} className="min-h-full space-y-1">
          {data.milestones.slice(0, 6).map((milestone, index) => {
            const isCompleted = milestone.status === "COMPLETED";
            const isCurrent = milestone.status === "IN_PROGRESS";

            return (
              <div
                key={milestone.name + index}
                className="
                  group/item
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-1
                  py-2.5
                  transition-colors
                  duration-200
                  hover:bg-muted/60
                  dark:hover:bg-white/[0.03]
                "
              >
                {/* ========================================================
                    NUMBER
                ========================================================= */}
                <div
                  className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    text-sm
                    font-bold
                    transition-all
                    duration-200

                    ${
                      isCompleted
                        ? "bg-primary text-white"
                        : isCurrent
                          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                          : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {index + 1}
                </div>

                {/* ========================================================
                    MILESTONE INFORMATION
                ========================================================= */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`
                      truncate
                      text-sm
                      font-semibold
                      leading-tight

                      ${
                        isCompleted
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }
                    `}
                  >
                    {milestone.name}
                  </p>

                  <p
                    className="
                      mt-1
                      truncate
                      text-xs
                      leading-tight
                      text-muted-foreground
                    "
                    title={milestone.status}
                  >
                    {milestone.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        </div>

        {/* ================================================================
            PROGRESS
        ================================================================= */}
        {/* <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Current:{" "}
              <span className="font-semibold text-foreground">
                {data.currentMilestone}
              </span>
            </span>

            <span className="text-xs font-bold text-primary">
              {data.progress}%
            </span>
          </div>

          {data.blockingPrerequisite && (
            <div className="mb-2.5 flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs text-amber-600 dark:text-amber-400">
              <span className="font-semibold">Prerequisite Required:</span>
              <span className="font-medium truncate">{data.blockingPrerequisite}</span>
            </div>
          )}

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-primary
                to-secondary
                transition-all
                duration-700
                ease-out
              "
              style={{
                width: `${Math.min(Math.max(data.progress, 0), 100)}%`,
              }}
            />
          </div>
        </div> */}

        {/* ================================================================
            BUTTON
        ================================================================= */}
        <Link
          href="/dashboard/learner/learning-path"
          className="btn-primary px-3 w-full mt-4 shrink-0 flex items-center justify-center gap-2"
        >
          View Full Roadmap <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
