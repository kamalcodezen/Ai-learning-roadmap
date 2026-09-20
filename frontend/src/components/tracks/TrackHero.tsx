"use client";

import { motion } from "motion/react";
import {
  ShieldCheck,
  Compass,
  Award,
} from "lucide-react";
import type { Track } from "@/src/data/tracks";
import Button from "@/src/components/ui/button";
import brandLogo from "../../../public/brand/AI-Pather-white.png"
import Image from "next/image";

const formatSalary = (value: number) =>
  `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;

const pills = [
  { icon: Compass, label: "AI Skills Diagnostic" },
  { icon: Award, label: "Career Proof" },
  { icon: ShieldCheck, label: "Job Readiness" },
];

export default function TrackHero({ track }: { track: Track }) {

  return (
    <section className="relative w-full overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-0">
      {/* Ambient gradient glow + grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[90%] w-[1100px] rounded-[100%] bg-primary/15 blur-[140px] pointer-events-none -z-10" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.03] -z-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(var(--foreground) / 0.4) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      {/* ===== Layout: 2 symmetrical columns (50/50 on lg+) ===== */}
      <div className="global-pos px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* ── Left: Overview copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-start text-left"
          >
            {/* Title */}
            <h1 className="section-title -mt-5 md:-mt-10 text-left lg:mt-4">
              {track.title.split(" ")[0]}{" "}
              <span className="text-brand">
                {track.title.split(" ").slice(1).join(" ")}
              </span>
            </h1>

            {/* Tagline */}
            <p className="mt-4 font-poppins text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
              {track.tagline}
            </p>

            {/* Overview */}
            <p className="mt-4 font-poppins text-base text-muted-foreground/90 leading-relaxed max-w-xl">
              {track.overview}
            </p>

            {/* Feature pills */}
            <div className="mt-7 flex flex-wrap gap-2.5">
              {pills.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 font-poppins text-xs font-medium text-muted-foreground backdrop-blur-sm"
                >
                  <Icon className="size-3.5 text-primary" />
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Role Snapshot Card (fills its 50% column) ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <div className="dashboard-card p-6 sm:p-8 h-full flex flex-col">
              {/* Icon + title row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white">
                    <Image src={brandLogo} alt="Brand-logo" className="ml-1 w-4 h-4 md:w-5 md:h-5 brightness-0 invert" height={20} width={20}/>
                  </span>
                  <div>
                    <h2 className="font-poppins text-lg font-bold text-foreground">
                      {track.title}
                    </h2>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      2026 Career Snapshot
                    </p>
                  </div>
                </div>
                <span className="sm:inline-flex hidden shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {track.badge}
                </span>
              </div>

              {/* Key stats grid */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-border/60 bg-card-soft/70 p-3 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Active Postings
                  </p>
                  <p className="mt-1 font-poppins text-lg font-extrabold text-foreground">
                    {track.stats.activePostings.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card-soft/70 p-3 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Median Salary
                  </p>
                  <p className="mt-1 font-poppins text-lg font-extrabold text-primary">
                    {formatSalary(track.stats.medianSalary)}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card-soft/70 p-3 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    YoY Demand
                  </p>
                  <p className="mt-1 font-poppins text-lg font-extrabold text-emerald-500">
                    +{track.stats.postingsYoY}%
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card-soft/70 p-3 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Growth by 2030
                  </p>
                  <p className="mt-1 font-poppins text-lg font-extrabold text-foreground">
                    +{track.stats.growthForecast}%
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card-soft/70 p-3 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Entry Openings
                  </p>
                  <p className="mt-1 font-poppins text-lg font-extrabold text-foreground">
                    {track.stats.entryLevelShare}%
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card-soft/70 p-3 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Remote
                  </p>
                  <p className="mt-1 font-poppins text-lg font-extrabold text-foreground">
                    {track.stats.remoteShare}%
                  </p>
                </div>
              </div>

              {/* CTA */}
              <Button
                text={track.ctaButton}
                href="/dashboard/learner"
                className="mt-6 h-11 self-start"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}