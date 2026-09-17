"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import Lenis from "lenis";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/Card";
import type { DashboardData } from "@/src/app/(dashboard)/dashboard/types";

interface Props {
  data?: DashboardData["roadmap"] | null;
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
  }, [data]);

  if (!data || !data.milestones || data.milestones.length === 0) {
    return (
      <Card
        className="rounded-lg p-6 h-full lg:h-[365px] border-2 border-background shadow-none dashboard-card flex flex-col justify-between"
      >
        <CardHeader className="relative z-10 pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle
              className="
                text-xl
                font-bold
                tracking-tight
                text-foreground
                flex items-center gap-2
              "
            >
              <Compass className="w-5 h-5 text-primary" />
              Your Roadmap
            </CardTitle>

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
              Ready to Start
            </span>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 flex min-h-0 flex-1 flex-col justify-between">
          <div className="space-y-2.5 my-auto">
            <div className="flex items-center gap-3 rounded-xl p-3 bg-card-soft border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-primary/30">
                1
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  Personalized Role Path
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Milestones dynamically aligned to your target role
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl p-3 bg-card-soft border border-border">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  Practical Project Blueprints
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Build production software to prove your competence
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/learner/learning-path"
            className="btn-primary w-full mt-4 shrink-0 flex items-center justify-center gap-2"
          >
            Explore Full Roadmap <ArrowRight className="w-4 h-4" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="rounded-lg p-6 h-full lg:h-[365px] border-2 border-background shadow-none dashboard-card flex flex-col justify-between"
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
              flex items-center gap-2
            "
          >
            <Compass className="w-5 h-5 text-primary" />
            Your Roadmap
          </CardTitle>

          {/* Progress indicator */}
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
      <CardContent className="relative z-10 flex min-h-0 flex-1 flex-col justify-between">
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
                  {/* NUMBER */}
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

                  {/* MILESTONE INFO */}
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
                      {milestone.status === "IN_PROGRESS"
                        ? "In Progress"
                        : milestone.status === "COMPLETED"
                          ? "Completed"
                          : "Pending"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTION BUTTON */}
        <Link
          href="/dashboard/learner/learning-path"
          className="btn-primary w-full mt-4 shrink-0 flex items-center justify-center gap-2"
        >
          View Full Roadmap <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
