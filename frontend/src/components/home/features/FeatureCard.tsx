"use client";

import React from "react";
import { FeatureItem } from "./types";

interface FeatureCardProps {
  feature: FeatureItem;
}

export default function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <div
      className="relative p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 bg-secondary dark:bg-[#ceff1f] backdrop-blur-md rounded-2xl h-full"
      style={{
        clipPath: "polygon(0% 0%, 82% 0%, 100% 12%, 100% 100%, 18% 100%, 0% 88%)",
      }}
    >
      {/* Top Floating Icon Badge */}
      <div className="w-12 h-12 rounded-md bg-[#ceff1f] dark:bg-secondary flex items-center justify-center text-background mb-6">
        <Icon className="w-6 h-6 text-secondary dark:text-[#ceff1f]" />
      </div>

      {/* Center Metric & Title Display */}
      <div className="space-y-2 my-4">
        <div className="flex items-baseline gap-1">
          <span className="text-h2 font-black text-background tracking-tight">
            {feature.metric}
          </span>
        </div>
        <h3 className="text-h3 font-bold tracking-tight text-background text-left">
          {feature.title}
        </h3>
      </div>

      {/* Bottom Description (Right-aligned) */}
      <div className="pt-4 border-t border-[#ceff1f]/20 dark:border-secondary mt-4">
        <p className="text-small text-background/80 text-right leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
}