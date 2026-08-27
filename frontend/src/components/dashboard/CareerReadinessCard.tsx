"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Crown } from "lucide-react";
import {
  HiOutlineBookOpen,
  HiOutlineCode,
  HiOutlineFolder,
  HiOutlinePuzzle,
  HiOutlineChat,
  HiOutlineUserGroup,
  HiOutlineBadgeCheck,
} from "react-icons/hi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DashboardData } from "@/src/app/(dashboard)/dashboard/types";

/* -------------------------------------------------------------------------- */
/*                                ANIMATION HOOKS                             */
/* -------------------------------------------------------------------------- */

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

function useAnimatedNumber(target: number, duration = 1000, animate = true, delayMs = 0): number {
  const [value, setValue] = useState(target);
  const currentValRef = useRef(target);

  useEffect(() => {
    if (!animate) {
      currentValRef.current = target;
      return;
    }

    let raf = 0;
    let timeout = 0;

    const startAnimation = () => {
      const from = currentValRef.current;
      if (from === target) return;

      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const nextValue = from + (target - from) * eased;

        currentValRef.current = nextValue;
        setValue(nextValue);

        if (p < 1) {
          raf = requestAnimationFrame(tick);
        }
      };
      raf = requestAnimationFrame(tick);
    };

    if (delayMs > 0) {
      timeout = window.setTimeout(startAnimation, delayMs);
    } else {
      startAnimation();
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [target, duration, animate, delayMs]);

  return animate ? value : target;
}

/* -------------------------------------------------------------------------- */
/*                               GAUGE CHART                                  */
/* -------------------------------------------------------------------------- */

const rad = (deg: number) => (deg * Math.PI) / 180;
const SIZE = 200;
const C = SIZE / 2;
const R = 70;

function ArcGauge({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const v = useAnimatedNumber(value, 1100, !reduced);
  const clamped = Math.max(v, 0.01);

  const ticks = Array.from({ length: 31 }, (_, i) => {
    const deg = -90 + i * 6;
    const a = rad(deg);
    const major = i % 5 === 0;
    const r1 = major ? 78 : 82;
    const r2 = 88;
    return {
      key: i,
      x1: Number((C + r1 * Math.sin(a)).toFixed(4)),
      y1: Number((C - r1 * Math.cos(a)).toFixed(4)),
      x2: Number((C + r2 * Math.sin(a)).toFixed(4)),
      y2: Number((C - r2 * Math.cos(a)).toFixed(4)),
      major,
      pct: (i / 30) * 100,
    };
  });

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE / 2 + 20 }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="relative block"
        role="img"
      >
        <defs>
          <linearGradient id="careerGaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-secondary)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
        </defs>

        {ticks.map((t) => {
          const isFilled = t.pct <= clamped;
          return (
            <line
              key={t.key}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              className={
                isFilled
                  ? "stroke-primary"
                  : t.major
                  ? "stroke-border"
                  : "stroke-border/50"
              }
              strokeWidth={t.major ? 2 : 1.5}
              strokeLinecap="round"
            />
          );
        })}

        <path
          d={`M ${C - R} ${C} A ${R} ${R} 0 0 1 ${C + R} ${C}`}
          fill="none"
          className="stroke-border"
          strokeWidth={10}
          strokeLinecap="round"
        />

        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="url(#careerGaugeGrad)"
          strokeWidth={10}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${clamped / 2} ${100 - clamped / 2}`}
          transform={`rotate(-180 ${C} ${C})`}
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-1">
        <div className="flex items-baseline gap-0.5">
          <span className="text-4xl font-extrabold tracking-tight text-foreground tabular-nums">
            {Math.round(v)}
          </span>
          <span className="text-sm font-semibold text-muted-foreground">%</span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Readiness
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               METRICS PANEL                                */
/* -------------------------------------------------------------------------- */

const METRICS_CONFIG = [
  { key: "knowledge", label: "Knowledge", icon: HiOutlineBookOpen },
  { key: "practical", label: "Practical", icon: HiOutlineCode },
  { key: "projects", label: "Projects", icon: HiOutlineFolder },
  { key: "problemSolving", label: "Problem Solving", icon: HiOutlinePuzzle },
  { key: "communication", label: "Communication", icon: HiOutlineChat },
  { key: "interview", label: "Interview", icon: HiOutlineUserGroup },
  { key: "evidence", label: "Evidence", icon: HiOutlineBadgeCheck },
] as const;

function AnimatedMetricNumber({ value, delayMs }: { value: number; delayMs: number }) {
  const reduced = useReducedMotion();
  const animatedValue = useAnimatedNumber(value, 800, !reduced, delayMs);
  return <>{Math.round(animatedValue)}</>;
}

function MetricsPanel({ data }: { data: Props["data"] }) {
  const reduced = useReducedMotion();

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full">
      {METRICS_CONFIG.map((metric, i) => {
        const val = data[metric.key] ?? 0;
        const Icon = metric.icon;
        const delayMs = i * 65;

        return (
          <div
            key={metric.key}
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {metric.label}
                </span>
              </div>
              <span className="text-[11px] font-bold tabular-nums text-foreground">
                <AnimatedMetricNumber value={val} delayMs={delayMs} />%
              </span>
            </div>

            <div className="relative h-1 w-full rounded-full bg-border overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${val}%` }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: delayMs / 1000 }
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

interface Props {
  data: DashboardData["readiness"];
  role: string;
}

export default function CareerReadinessCard({ data, role }: Props) {
  return (
    <Card mouseGlow className="group relative overflow-hidden rounded-md p-6 transition-all duration-300 border-2 border-background hover:border-brand shadow-none bg-[linear-gradient(to_bottom,#faf5ff_0%,#f3edff_45%,#ede5ff_100%)] dark:bg-[linear-gradient(to_bottom,#1a0e2e_0%,rgba(159,84,247,0.15)_100%)]">
      {/* Corner shape */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Career Readiness</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <Crown className="w-4 h-4 text-secondary shrink-0" />
          <p className="text-xs text-muted-foreground">
            Target: <span className="font-semibold text-foreground">{role}</span>
          </p>
        </div>

        <ArcGauge value={data.score} />

        <MetricsPanel data={data} />

        <Link
          href="/career-twin"
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          View Career Twin <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
