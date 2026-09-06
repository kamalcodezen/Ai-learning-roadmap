"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Target } from "lucide-react";
import dashboardBanner from "@/public/images/dashboardBanner.png";
import dashboardBannerDark from "@/public/images/dashboardBannerDark.png";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import type { DashboardData } from "../../shared/types";

interface ProgressStat {
  value: number | string;
  label: string;
  subtext?: string;
}

interface DashboardBannerProps {
  readiness?: DashboardData["readiness"];
  career?: DashboardData["career"];
  kpis?: DashboardData["kpis"];
  roadmap?: DashboardData["roadmap"];
  proof?: DashboardData["proof"];
}

export default function WelcomeStatsSection({
  readiness,
  career,
  kpis,
  roadmap,
  proof,
}: DashboardBannerProps) {
  const { data: session, isPending } = useDashboardSession();

  const [dark, setDark] = useState(() =>
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false,
  );

  useEffect(() => {
    const syncTheme = () =>
      setDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const firstName =
    session?.user?.name?.trim().split(" ")[0] || "there";

  const capitalizedFirstName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const targetRole = kpis?.targetRole || career?.targetRole || "";

  const resolveKpiValue = (val: number | null | undefined): number | string => {
    if (typeof val === "number" && !isNaN(val)) {
      return val;
    }
    return "Not enough data yet";
  };

  const stats: ProgressStat[] = [
    {
      value: resolveKpiValue(kpis?.careerReadiness ?? readiness?.score),
      label: "Career Readiness",
      subtext: "Authoritative readiness score",
    },
    {
      value: resolveKpiValue(kpis?.skillProgress ?? proof?.overallSkillScore),
      label: "Skill Progress",
      subtext: "Verified skill proficiency",
    },
    {
      value: resolveKpiValue(kpis?.learningProgress ?? roadmap?.progress),
      label: "Learning Progress",
      subtext: "Roadmap milestone completion",
    },
    {
      value: resolveKpiValue(kpis?.proofStrength ?? proof?.overallProofScore),
      label: "Proof Strength",
      subtext: "Verified project evidence",
    },
  ];

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        rounded-md
        border
        border-border
        min-h-[200px]
        sm:min-h-[220px]
        lg:min-h-[250px]
      "
    >
      {/* ================================================================
          BACKGROUND IMAGE
          No overlay.
      ================================================================= */}
      <Image
        src={dark ? dashboardBannerDark : dashboardBanner}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* ================================================================
          CONTENT
      ================================================================= */}
      <div
        className="
          relative
          z-10
          flex
          min-h-[200px]
          flex-col
          justify-between
          px-4
          py-5
          sm:min-h-[220px]
          sm:px-6
          sm:py-6
          lg:min-h-[250px]
          lg:px-8
          lg:py-7
        "
      >
        {/* ================================================================
            HEADER
        ================================================================= */}
        <div>
          {isPending ? (
            <div className="space-y-2">
              <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2
                  className="
                    text-2xl
                    font-extrabold
                    leading-tight
                    tracking-tight
                    text-foreground
                    sm:text-3xl
                  "
                >
                  <span>Welcome back, </span>
                  <span className="text-secondary">{capitalizedFirstName}</span>
                </h2>

                {targetRole && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/60 dark:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm shadow-xs">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    <span className="text-muted-foreground">Target Career:</span>
                    <span className="font-bold text-foreground">{targetRole}</span>
                  </div>
                )}
              </div>

              <p
                className="
                  mt-1
                  text-sm
                  font-medium
                  leading-relaxed
                  text-foreground
                  sm:text-base
                "
              >
                Here&apos;s an authoritative overview of your career readiness and learning progress.
              </p>
            </>
          )}
        </div>

        {/* ================================================================
            STAT CARDS
        ================================================================= */}
        <div
          className="
            mt-5
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-2
            lg:grid-cols-4
            lg:gap-4
          "
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/70
                bg-white/70
                px-4
                py-4
                shadow-[0_8px_30px_rgba(0,0,0,0.05)]
                transition-all
                duration-300
                hover:border-primary/25
                hover:shadow-[0_12px_35px_rgba(159,84,247,0.10)]
                dark:border-white/10
                dark:bg-[#111111]/70
                dark:shadow-none
                dark:hover:border-primary/30
                dark:hover:shadow-[0_0_30px_rgba(185,120,255,0.08)]
                backdrop-blur-xs
              "
            >
              {/* ==========================================================
                  STATIC PURPLE CARD GLOW
                  Same design for every card.
              ========================================================== */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-8
                  -top-8
                  h-20
                  w-20
                  rounded-full
                  bg-primary/10
                  blur-2xl
                  transition-all
                  duration-500
                  group-hover:bg-primary/20
                "
                aria-hidden="true"
              />

              {/* ==========================================================
                  CARD CONTENT
              ========================================================== */}
              <div className="relative z-10">
                {/* Value */}
                {typeof stat.value === "number" ? (
                  <div
                    className="
                      text-3xl
                      font-extrabold
                      leading-none
                      tracking-tight
                      text-primary
                      sm:text-4xl
                    "
                  >
                    {stat.value}%
                  </div>
                ) : (
                  <div className="text-sm font-semibold leading-snug text-muted-foreground sm:text-base py-1.5">
                    {stat.value}
                  </div>
                )}

                {/* Label */}
                <p
                  className="
                    mt-2
                    text-xs
                    font-medium
                    text-muted-foreground
                    sm:text-sm
                  "
                >
                  {stat.label}
                </p>

                {stat.subtext && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70 hidden sm:block">
                    {stat.subtext}
                  </p>
                )}

                {/* Static purple accent */}
                <div
                  className="
                    mt-4
                    h-1
                    w-9
                    rounded-full
                    bg-gradient-to-r
                    from-primary
                    to-secondary
                    transition-all
                    duration-300
                    group-hover:w-14
                  "
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
