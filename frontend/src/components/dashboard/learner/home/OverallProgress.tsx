"use client";

import { Crown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

interface OverallProgressProps {
  value: number;
  role: string;
}

export default function OverallProgress({ value, role }: OverallProgressProps) {
  const percentage = Math.min(Math.max(value, 0), 100);

  // SVG circle calculations
  const size = 150;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progressOffset =
    circumference - (percentage / 100) * circumference;

  return (
    <Card
      mouseGlow
      className="group relative overflow-hidden rounded-md p-6 transition-all duration-300 border-2 border-background hover:border-brand shadow-none bg-[linear-gradient(to_bottom,#faf5ff_0%,#f3edff_45%,#ede5ff_100%)] dark:bg-[linear-gradient(to_bottom,#1a0e2e_0%,rgba(159,84,247,0.15)_100%)]"
    >
      {/* Corner shape */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Overall Progress</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <Crown className="w-4 h-4 text-secondary shrink-0" />
          <p className="text-xs text-muted-foreground">
            Target: <span className="font-semibold text-foreground">{role}</span>
          </p>
        </div>

        <div className="flex flex-col items-center justify-center pt-2">
          {/* Circular progress */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="-rotate-90"
            >
              <defs>
                <linearGradient
                  id="overall-progress-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#9F54F7" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>

              {/* Background ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                className="stroke-border"
                strokeWidth={strokeWidth}
              />

              {/* Progress ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="url(#overall-progress-gradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                className="transition-[stroke-dashoffset] duration-700 ease-out"
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-medium tracking-wide text-muted-foreground">
                Completed
              </span>

              <span className="mt-1 text-4xl font-extrabold leading-none tracking-tight text-foreground">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-border" />

        {/* Motivation */}
        <p className="text-center text-sm leading-6 text-muted-foreground">
          Keep going — Push through today and watch your progress take shape.
        </p>
      </CardContent>
    </Card>
  );
}
