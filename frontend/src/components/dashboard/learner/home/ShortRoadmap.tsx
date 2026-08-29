"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import type { DashboardData } from "@/src/app/(dashboard)/dashboard/types";

interface Props {
  data: DashboardData["roadmap"];
}

export default function ShortRoadmap({ data }: Props) {
  if (!data) {
    return (
      <Card mouseGlow className="group relative overflow-hidden rounded-md p-6 transition-all duration-300 border-2 border-background hover:border-brand shadow-none bg-[linear-gradient(to_bottom,#faf5ff_0%,#f3edff_45%,#ede5ff_100%)] dark:bg-[linear-gradient(to_bottom,#1a0e2e_0%,rgba(159,84,247,0.15)_100%)]">
        <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />
        <CardHeader className="relative z-10 pb-2">
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
        mouseGlow
        className="group relative overflow-hidden rounded-md p-6 transition-all duration-300 border-2 border-background hover:border-brand shadow-none bg-[linear-gradient(to_bottom,#faf5ff_0%,#f3edff_45%,#ede5ff_100%)] dark:bg-[linear-gradient(to_bottom,#1a0e2e_0%,rgba(159,84,247,0.15)_100%)]"
      >
      {/* Corner shape */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />

      {/* ================================================================
          HEADER
      ================================================================= */}
      <CardHeader className="relative z-10 pb-2">
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
      <CardContent className="relative z-10">
        <div className="space-y-1">
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

        {/* ================================================================
            PROGRESS
        ================================================================= */}
        <div className="mt-4">
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
        </div>

        {/* ================================================================
            BUTTON
        ================================================================= */}
        <Link
          href="/dashboard/learner/learning-path"
          className="
            mt-5
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-primary/10
            px-4
            py-3
            text-sm
            font-semibold
            text-primary
            transition-all
            duration-200
            hover:bg-primary/15
            hover:text-secondary
            dark:bg-primary/10
            dark:hover:bg-primary/15
          "
        >
          View Full Roadmap
          <ArrowRight
            className="
              h-4
              w-4
              transition-transform
              duration-200
              group-hover:translate-x-0.5
            "
          />
        </Link>
      </CardContent>
    </Card>
  );
}
