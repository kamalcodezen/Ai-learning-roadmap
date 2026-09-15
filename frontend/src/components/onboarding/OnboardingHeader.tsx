"use client";

import Image from "next/image";
import Link from "next/link";

import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";

import brandLogo from "../../../public/brand/AI-Pather-blue.png";

interface OnboardingHeaderProps {
  step: number;
  totalSteps: number;
}

export function OnboardingHeader({ step, totalSteps }: OnboardingHeaderProps) {
  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-4">
        <Link className="group flex items-center gap-3" href="/">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shadow-[0_0_30px_rgba(159,84,247,0.10)]">
            <Image
              src={brandLogo}
              alt="Brand-logo"
              className="ml-1 h-4 w-4 brightness-0 dark:invert md:h-5 md:w-5"
              height={20}
              width={20}
            />
          </div>

          <div>
            <div className="text-sm font-bold tracking-tight">AI Pather</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Your learning partner
            </div>
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