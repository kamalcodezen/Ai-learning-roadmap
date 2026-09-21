"use client";

import React from "react";
import { FeatureItem } from "./types";

interface FeatureCardProps {
  feature: FeatureItem;
  hideBorder?: boolean;
}

export default function FeatureCard({ feature, hideBorder }: FeatureCardProps) {
  const Icon = feature.icon;
  const gradientId = `card-border-${feature.id}`;

  return (
    <div
      className="group relative p-6 md:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 bg-secondary dark:bg-primary backdrop-blur-md rounded-md h-full overflow-hidden"
      style={{
        clipPath:
          "polygon(0% 0%, 82% 0%, 100% 12%, 100% 100%, 18% 100%, 0% 88%)",
      }}
    >
      {/* Shape-matched animated border */}
      {!hideBorder && (
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon
            points="0,0 82,0 100,12 100,100 18,100 0,88"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="4"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset="100"
            className="transition-all duration-700 ease-out group-hover:[stroke-dashoffset:0]"
          />

          <defs>
            <linearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                className="[stop-color:white] dark:[stop-color:white]"
              />
              <stop
                offset="50%"
                className="[stop-color:#fde047] dark:[stop-color:#67e8f9]"
              />
              <stop
                offset="100%"
                className="[stop-color:#fb923c] dark:[stop-color:#a855f7]"
              />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* Top Floating Icon Badge */}
      <div className="w-12 h-12 rounded-md bg-primary dark:bg-secondary flex items-center justify-center text-background mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Center Metric & Title Display */}
      <div>
        <div className="flex items-baseline">
          <span className="text-2xl font-semibold text-background tracking">
            {feature.metric}
          </span>
        </div>

        <h3 className="text-base font-semibold tracking text-background text-left">
          {feature.title}
        </h3>
      </div>

      {/* Bottom Description */}
      <div className="pt-2 border-t border-white/20 dark:border-white/20 mt-2">
        <p className="text-xs text-background/80 text-right leading tracking-tight">
          {feature.description}
        </p>
      </div>
    </div>
  );
}