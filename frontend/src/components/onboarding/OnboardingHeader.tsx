import Image from "next/image";

import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";

import type { ExperienceLevel } from "./ExperienceSection";
import brandLogo from "../../../public/brand/AI-Pather-blue.png"
import Link from "next/link";

interface OnboardingHeaderProps {
  canContinue: boolean;
  selectedTrack: string;
  customGoal: string;
  experience: ExperienceLevel | "";
}

export function OnboardingHeader({
  canContinue,
  selectedTrack,
  customGoal,
  experience,
}: OnboardingHeaderProps) {
  const progressWidth = canContinue
    ? "w-full"
    : selectedTrack || customGoal
      ? "w-2/3"
      : experience
        ? "w-1/2"
        : "w-1/4";

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
  className="
    flex
    items-center
    gap-3
  "
  href="/"
>
  {/* Inside this div is just the logo icon box */}
  <div
    className="
      flex
      h-10
      w-10
      items-center
      justify-center
      rounded-xl
      border
      border-primary/20
      bg-primary/10
      shadow-[0_0_30px_rgba(206,255,31,0.08)]
    "
  >
    <Image 
      src={brandLogo} 
      alt="Brand-logo" 
      className="ml-1 w-4 h-4 md:w-5 md:h-5 brightness-0 dark:invert" 
      height={20} 
      width={20}
    />
  </div>

  {/* This div holds the text next to the logo icon */}
  <div>
    <div className="text-sm font-bold tracking-tight">AI Pather</div>
    <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
      Your learning partner
    </div>
  </div>
</Link>
</div>


        <div className="hidden items-center gap-3 sm:flex">
          <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
            STEP 01
          </span>
          <span className="hidden text-xs text-muted-foreground md:inline">
            Career Profile
          </span>
          <AnimatedThemeToggler />
        </div>
      </header>

      <div className="mb-10 max-w-4xl">
        <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
          Build the career path
          <br />
          <span className="text-[#9F54F7]">
            that actually fits you.
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          Tell AI Pather where you want to go and where you are starting from.
          We&apos;ll use this information to shape your diagnostic, adaptive
          roadmap, and Career Twin.
        </p>
      </div>

      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Initialization
          </span>
          <span className="text-xs text-muted-foreground">1 of 3</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full bg-primary shadow-[0_0_12px_rgba(206,255,31,0.5)] transition-all duration-500 ${progressWidth}`} />
        </div>
      </div>
    </>
  );
}
