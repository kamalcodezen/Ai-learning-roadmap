"use client";

import { ReactNode } from "react";
import Image from "next/image";

import { useEffect, useState } from "react";
import dashboardBanner from "@/public/images/dashboardBanner.png";
import dashboardBannerDark from "@/public/images/dashboardBannerDark.png";

export interface DashboardBannerStat {
  value: number | string;
  label: string;
  subtext?: string;
  suffix?: string;
}

interface DashboardBannerProps {
  title: ReactNode;
  subtitle: ReactNode;
  stats: DashboardBannerStat[];
  rightSlot?: ReactNode;
}

export default function DashboardBanner({
  title,
  subtitle,
  stats,
  rightSlot,
}: DashboardBannerProps) {
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

  return (
    <section className="relative w-full overflow-hidden rounded-xl border border-border min-h-[200px] sm:min-h-[220px] lg:min-h-[250px]">
      <Image
        src={dark ? dashboardBannerDark : dashboardBanner}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      <div className="relative z-10 flex min-h-[200px] flex-col justify-between px-4 py-5 sm:min-h-[220px] sm:px-6 sm:py-6 lg:min-h-[250px] lg:px-8 lg:py-7">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
              {title}
            </h2>
            {rightSlot}
          </div>
          <p className="mt-1 text-sm font-medium leading-relaxed text-foreground sm:text-base">
            {subtitle}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/70 px-4 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-primary/25 hover:shadow-[0_12px_35px_rgba(159,84,247,0.10)] dark:border-white/10 dark:bg-[#111111]/70 dark:shadow-none dark:hover:border-primary/30 dark:hover:shadow-[0_0_30px_rgba(185,120,255,0.08)] backdrop-blur-xs"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:bg-primary/20"
                aria-hidden="true"
              />
              <div className="relative z-10">
                {typeof stat.value === "number" ? (
                  <div className="text-3xl font-extrabold leading-none tracking-tight text-primary sm:text-4xl">
                    {stat.value}
                    {stat.suffix ?? "%"}
                  </div>
                ) : (
                  <div className="py-1.5 text-sm font-semibold leading-snug text-muted-foreground sm:text-base">
                    {stat.value}
                  </div>
                )}
                <p className="mt-2 text-xs font-medium text-muted-foreground sm:text-sm">
                  {stat.label}
                </p>
                {stat.subtext && (
                  <p className="mt-0.5 hidden text-[11px] text-muted-foreground/70 sm:block">
                    {stat.subtext}
                  </p>
                )}
                <div className="mt-4 h-1 w-9 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}