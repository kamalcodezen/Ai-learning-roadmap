"use client";

import Image from "next/image";
import Link from "next/link";

import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";

interface OnboardingHeaderProps {
  step: number;
  totalSteps: number;
}

export function OnboardingHeader({ step, totalSteps }: OnboardingHeaderProps) {
  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-4">
        <Link className="group flex flex-col gap-0.5" href="/" aria-label="AI Pather home">
          <Image
            src="/brand/AI-Pather-blue.png"
            alt="AI Pather"
            width={140}
            height={26}
            className="h-6 md:h-7 w-auto block dark:hidden object-contain"
            priority
          />
          <Image
            src="/brand/AI-Pather-white.png"
            alt="AI Pather"
            width={140}
            height={26}
            className="h-6 md:h-7 w-auto hidden dark:block object-contain"
            priority
          />
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Your learning partner
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
            STEP {String(step + 1).padStart(2, "0")}
          </span>
          <AnimatedThemeToggler />
        </div>
      </header>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`
              h-1 flex-1 rounded-full transition-all duration-500
              ${index <= step ? "bg-primary shadow-[0_0_12px_rgba(159,84,247,0.45)]" : "bg-muted"}
            `}
          />
        ))}
      </div>
    </div>
  );
}