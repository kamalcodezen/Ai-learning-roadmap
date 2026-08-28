"use client";

import Image from "next/image";

import dashboardBanner from "../../../../public/images/dashboardBanner.png";
import { authClient } from "../../../lib/auth-client";
import type { DashboardData } from "../types";

interface ProgressStat {
  value: number;
  label: string;
}

interface DashboardBannerProps {
  readiness?: DashboardData["readiness"];
}

export default function WelcomeStatsSection({
  readiness,
}: DashboardBannerProps) {
  const { data: session, isPending } = authClient.useSession();

  const firstName =
    session?.user?.name?.trim().split(" ")[0] || "there";

  const capitalizedFirstName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const stats: ProgressStat[] = [
    {
      value: readiness?.knowledge ?? 0,
      label: "Knowledge Practice",
    },
    {
      value: readiness?.practical ?? 0,
      label: "Practical",
    },
    {
      value: readiness?.problemSolving ?? 0,
      label: "Problem Solving",
    },
    {
      value: readiness?.projects ?? 0,
      label: "Projects",
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
        src={dashboardBanner}
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
              <h2
                className="
                  text-2xl
                  font-extrabold
                  leading-tight
                  tracking-tight
                  text-gray-800
                  sm:text-3xl
                "
              >
                <span>Welcome back, </span>
                <span className="text-secondary">{capitalizedFirstName}</span>
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  font-medium
                  leading-relaxed
                  text-[#374151]
                  sm:text-base
                "
              >
                Here&apos;s an overview of your learning progress.
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