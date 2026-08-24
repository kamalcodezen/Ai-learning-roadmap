"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { FiChevronDown, FiUser, FiCheck } from "react-icons/fi";
import { IoRocketOutline } from "react-icons/io5";
import { HiOutlineBookOpen, HiOutlineCode, HiOutlineFolder, HiOutlinePuzzle, HiOutlineChat, HiOutlineUserGroup, HiOutlineBadgeCheck } from "react-icons/hi";
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiNodedotjs, SiPostgresql, SiMongodb, SiFirebase } from "react-icons/si";
import { ContainerScroll } from "@/src/components/ui/container-scroll-animation";
import { motion, AnimatePresence } from "framer-motion";



/* ------------------------------ data ------------------------------ */

export type StageIconName = "book" | "zap" | "chat" | "cube" | "shield";

export type Stage = { label: string; desc: string; icon: StageIconName };

export const STAGES: Stage[] = [
  { label: "KNOW", desc: "Learn the basics", icon: "book" },
  { label: "GAIN", desc: "Apply in practice", icon: "zap" },
  { label: "CAN EXPLAIN", desc: "Share your knowledge", icon: "chat" },
  { label: "CAN BUILD", desc: "Build real projects", icon: "cube" },
  { label: "CAN IMPACT", desc: "Share your impact", icon: "shield" },
];

export const METRIC_LABELS = [
  { name: "Knowledge", icon: HiOutlineBookOpen },
  { name: "Practical", icon: HiOutlineCode },
  { name: "Projects", icon: HiOutlineFolder },
  { name: "Problem Solving", icon: HiOutlinePuzzle },
  { name: "Communication", icon: HiOutlineChat },
  { name: "Interview", icon: HiOutlineUserGroup },
  { name: "Evidence", icon: HiOutlineBadgeCheck },
];

export type Role = {
  id: string;
  label: string;
  score: number;
  stage: number;
  metrics: number[];
};

export const ROLES: Role[] = [
  {
    id: "ai-engineer",
    label: "AI Engineer",
    score: 74,
    stage: 2, // CAN EXPLAIN
    metrics: [82, 68, 76, 71, 64, 59, 81],
  },
  {
    id: "web3-dev",
    label: "Web3 Developer",
    score: 86,
    stage: 4, // CAN IMPACT
    metrics: [91, 85, 93, 88, 72, 64, 90],
  },
  {
    id: "sc-auditor",
    label: "Smart Contract Auditor",
    score: 63,
    stage: 1, // GAIN
    metrics: [89, 72, 60, 92, 51, 45, 68],
  },
  {
    id: "ml-researcher",
    label: "ML Researcher",
    score: 91,
    stage: 3, // CAN BUILD
    metrics: [96, 88, 92, 94, 85, 78, 89],
  },
  {
    id: "blockchain-analyst",
    label: "Blockchain Analyst",
    score: 48,
    stage: 0, // KNOW
    metrics: [65, 42, 38, 55, 48, 30, 41],
  },
];

/* ------------------------------ hooks ------------------------------ */

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function useAnimatedNumber(target: number, duration = 1000, animate = true, delayMs = 0): number {
  const [value, setValue] = useState(target);
  const currentValRef = useRef(target);
  // eslint-disable-next-line react-hooks/refs
  currentValRef.current = value;

  useEffect(() => {
    if (!animate) {
      currentValRef.current = target;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(target);
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

  return value;
}

/* ------------------------------ Gauge ------------------------------ */

const rad = (deg: number) => (deg * Math.PI) / 180;
const SIZE = 240;
const C = SIZE / 2;
const R = 96;

function Gauge({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const v = useAnimatedNumber(value, 1100, !reduced);

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = rad(i * 6);
    const major = i % 5 === 0;
    const r1 = major ? 106 : 110;
    const r2 = 114;
    return {
      key: i,
      x1: Number((C + r1 * Math.sin(a)).toFixed(4)),
      y1: Number((C - r1 * Math.cos(a)).toFixed(4)),
      x2: Number((C + r2 * Math.sin(a)).toFixed(4)),
      y2: Number((C - r2 * Math.cos(a)).toFixed(4)),
      major,
    };
  });

  const clamped = Math.max(v, 0.01);

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="relative block drop-shadow-sm"
        role="img"
      >
        <defs>
          <linearGradient id="gaugeGradLight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-secondary)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
        </defs>

        {ticks.map((t, i) => {
          const isFilled = (i / 60) * 100 <= clamped;
          return (
            <line
              key={t.key}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              className={isFilled ? "stroke-[var(--color-primary)]" : (t.major ? "stroke-gray-300 dark:stroke-zinc-700" : "stroke-gray-100 dark:stroke-zinc-800")}
              strokeWidth={t.major ? 2 : 1.5}
              strokeLinecap="round"
            />
          )
        })}

        {/* track */}
        <circle cx={C} cy={C} r={R} fill="none" className="stroke-gray-100 dark:stroke-zinc-800" strokeWidth={10} />

        {/* progress arc */}
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="url(#gaugeGradLight)"
          strokeWidth={10}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${clamped} ${100 - clamped + 2}`}
          transform={`rotate(-90 ${C} ${C})`}
        />
      </svg>

      {/* center readout */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-caption font-semibold tracking-widest text-muted-foreground">OVERALL SCORE</span>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-6xl font-bold tracking-tight text-[var(--color-primary)] tabular-nums">
            {Math.round(v)}
          </span>
          <span className="text-body-large font-medium text-muted-foreground">/100</span>
        </div>
        <span className="mt-1 text-small font-medium text-muted-foreground">Keep Going!</span>
      </div>
    </div>
  );
}

/* ------------------------------ MetricsPanel ------------------------------ */

function AnimatedMetricNumber({ value, delayMs }: { value: number; delayMs: number }) {
  const reduced = useReducedMotion();
  const animatedValue = useAnimatedNumber(value, 800, !reduced, delayMs);
  return <>{Math.round(animatedValue)}</>;
}

function MetricsPanel({ values }: { values: number[] }) {
  return (
    <div className="flex flex-col gap-5">
      {METRIC_LABELS.map((metric, i) => {
        const val = values[i] ?? 0;
        const Icon = metric.icon;
        const delayMs = i * 75;
        return (
          <div key={metric.name} className="group relative flex items-center gap-4">
            <div className="flex w-32 shrink-0 items-center gap-3">
              <Icon className="h-5 w-5 text-[var(--color-primary)]" />
              <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{metric.name}</span>
            </div>

            <div className="relative h-2 flex-1 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[var(--color-primary)]"
                initial={{ width: 0 }}
                animate={{ width: `${val}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: delayMs / 1000 }}
              />
            </div>

            <span className="w-12 text-right text-sm tabular-nums">
              <strong className="text-[var(--color-primary)]">
                <AnimatedMetricNumber value={val} delayMs={delayMs} />
              </strong>
              <span className="text-gray-400 dark:text-zinc-500 text-xs">/100</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ Pipeline ------------------------------ */

function StageIcon({ name, className }: { name: StageIconName; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (name) {
    case "book":
      return (
        <svg {...common}>
          <path d="M12 6.3C10 4.6 7.4 3.8 4 3.8v13.4c3.4 0 6 .8 8 2.5 2-1.7 4.6-2.5 8-2.5V3.8c-3.4 0-6 .8-8 2.5Z" />
          <path d="M12 6.3v13.4" />
        </svg>
      );
    case "zap":
      return (
        <svg {...common}>
          <path d="M13 2 4.8 13.2h5.7L11 22l8.2-11.2h-5.7L13 2Z" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M20 14a2 2 0 0 1-2 2H9.5L4 20.4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8Z" />
          <path d="M8.5 10h.01M12 10h.01M15.5 10h.01" strokeWidth={2.2} />
        </svg>
      );
    case "cube":
      return (
        <svg {...common}>
          <path d="m12 2.5 8 4.4v9.2l-8 4.4-8-4.4V6.9l8-4.4Z" />
          <path d="M12 11.5 4.4 7.2M12 11.5l7.6-4.3M12 11.5v8.9" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 2.5 4.5 5.4v5.7c0 4.9 3.2 8.3 7.5 10.4 4.3-2.1 7.5-5.5 7.5-10.4V5.4L12 2.5Z" />
          <path d="m8.7 11.8 2.3 2.3 4.3-4.4" />
        </svg>
      );
  }
}

function Pipeline({ stage }: { stage: number }) {
  return (
    <div className="flex w-full items-start justify-between">
      {STAGES.map((s, i) => {
        const cleared = i <= stage;
        const active = i === stage;
        const connectorDone = i < stage;

        return (
          <Fragment key={s.label}>
            <div className="flex shrink-0 flex-col items-center">
              <motion.div
                initial={false}
                animate={{ scale: active ? [1, 1.15, 1] : 1 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: i * 0.05 }}
                className={`relative flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full border-2 transition-colors duration-500 bg-white dark:bg-zinc-950 z-10 ${cleared
                    ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-600"
                  }`}
              >
                <StageIcon name={s.icon} className="h-4 w-4 md:h-6 md:w-6" />
              </motion.div>

              <span className={`mt-2 md:mt-3 text-caption md:text-small font-bold tracking-wide transition-colors duration-500 w-12 md:w-auto text-center ${cleared ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              <span className="mt-1 text-caption text-muted-foreground w-12 md:w-20 text-center leading-tight">
                {s.desc}
              </span>
            </div>

            {i < STAGES.length - 1 && (
              <div className="flex-1 px-1 md:px-2 mt-5 md:mt-7 z-0">
                <div className={`h-1 md:h-1.5 w-full rounded-full transition-colors duration-500 ${connectorDone ? "bg-[var(--color-primary)]" : "bg-muted"}`} />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}


function FloatingIcon({ icon: Icon, className, delay, duration, colorClassName }: { icon: React.ElementType, className: string, delay: number, duration: number, colorClassName?: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={reducedMotion ? {} : { y: [-10, 10, -10] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
      className={`absolute hidden lg:flex items-center justify-center w-[72px] h-[72px] rounded-[24px] bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-gray-100 dark:border-zinc-800 z-10 ${className}`}
    >
      <Icon className={`w-10 h-10 ${colorClassName || 'text-gray-400 dark:text-zinc-600'}`} />
    </motion.div>
  );
}

export default function CareerTwinSection() {
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const role = ROLES[selectedRoleIndex];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      setIsRedirecting(false);
    }, 2000);
  };

  return (
    <section className="bg-[var(--color-surface)] py-section overflow-hidden relative">
      {/* Orbit Ring Background & Icons */}
      <div className="absolute top-[50%] left-1/2 w-[140vw] max-w-[1600px] h-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-[100%] border border-dashed border-gray-300 dark:border-zinc-800 hidden lg:block z-0 pointer-events-none">

        {/* Top: Next.js */}
        <FloatingIcon icon={SiNextdotjs} delay={0} duration={4.5} className="top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" colorClassName="text-black dark:text-white" />

        {/* Top Right: Node.js */}
        <FloatingIcon icon={SiNodedotjs} delay={1.5} duration={5} className="top-[14.6%] right-[14.6%] translate-x-1/2 -translate-y-1/2" colorClassName="text-[#339933]" />

        {/* Right: MongoDB */}
        <FloatingIcon icon={SiMongodb} delay={0.5} duration={4.8} className="top-1/2 right-0 translate-x-1/2 -translate-y-1/2" colorClassName="text-[#47A248]" />

        {/* Bottom Right: PostgreSQL */}
        <FloatingIcon icon={SiPostgresql} delay={2.2} duration={5.5} className="bottom-[14.6%] right-[14.6%] translate-x-1/2 translate-y-1/2" colorClassName="text-[#4169E1]" />

        {/* Bottom: Firebase */}
        <FloatingIcon icon={SiFirebase} delay={1.8} duration={4.2} className="bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" colorClassName="text-[#FFCA28]" />

        {/* Bottom Left: Tailwind */}
        <FloatingIcon icon={SiTailwindcss} delay={2.5} duration={5.2} className="bottom-[14.6%] left-[14.6%] -translate-x-1/2 translate-y-1/2" colorClassName="text-[#06B6D4]" />

        {/* Left: TypeScript */}
        <FloatingIcon icon={SiTypescript} delay={1.0} duration={4.6} className="top-1/2 left-0 -translate-x-1/2 -translate-y-1/2" colorClassName="text-[#3178C6]" />

        {/* Top Left: React */}
        <FloatingIcon icon={SiReact} delay={0.8} duration={5.1} className="top-[14.6%] left-[14.6%] -translate-x-1/2 -translate-y-1/2" colorClassName="text-[#61DAFB]" />

        {/* Decorative Dotted Accents */}
        <div className="absolute top-[14.6%] right-[14.6%] w-2 h-2 bg-[var(--color-primary)] rounded-full shadow-[0_0_10px_var(--color-primary)] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-[14.6%] left-[14.6%] w-2 h-2 bg-[var(--color-primary)] rounded-full shadow-[0_0_10px_var(--color-primary)] -translate-x-1/2 translate-y-1/2" />
        <div className="absolute right-0 top-1/2 w-2 h-2 bg-[var(--color-primary)] rounded-full shadow-[0_0_10px_var(--color-primary)] translate-x-1/2 -translate-y-1/2" />
      </div>

      <ContainerScroll
        titleComponent={
          <>
            <h2 className="text-3xl tracking-tight text-gray-900 dark:text-zinc-100 sm:text-5xl">
              Career twin
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto mb-4">
              Track your progress and match your skills to real-world roles.
            </p>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 h-full bg-white dark:bg-zinc-950 sm:bg-transparent dark:sm:bg-transparent">
          {/* ============ LEFT PANEL — PROFILE ============ */}
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm lg:col-span-4 flex flex-col">
            <h3 className="text-sm tracking-widest text-gray-800 dark:text-zinc-200 mb-6 uppercase">YOUR PROFILE</h3>

            <div className="relative mb-8" ref={dropdownRef}>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-zinc-800 p-3 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors cursor-pointer bg-white dark:bg-zinc-900 z-20 relative"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <FiUser className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="font-bold text-gray-900 dark:text-zinc-100 leading-tight">{role.label}</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-400">Role</div>
                  </div>
                </div>
                <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
                  <FiChevronDown className="h-5 w-5 text-gray-400 dark:text-zinc-600" />
                </motion.div>
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden z-30 flex flex-col p-1.5"
                  >
                    {ROLES.map((r, idx) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelectedRoleIndex(idx);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between rounded-lg p-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 ${idx === selectedRoleIndex ? "bg-gray-50 dark:bg-zinc-800" : ""
                          }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">{r.label}</span>
                          <span className="text-xs text-gray-500 dark:text-zinc-400">Score: {r.score}</span>
                        </div>
                        {idx === selectedRoleIndex && <FiCheck className="text-[var(--color-primary)] h-4 w-4" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 flex items-center justify-center py-6 relative z-0">
              <Gauge value={role.score} />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAction}
              disabled={isRedirecting}
              className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-4 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(159,84,247,0.39)] transition-colors ${isRedirecting ? "opacity-80 cursor-wait" : ""}`}
            >
              {isRedirecting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-4 w-4 rounded-full border-2 border-gray-900 border-t-transparent"
                  />
                  Redirecting...
                </>
              ) : (
                <>
                  <IoRocketOutline className="h-5 w-5" />
                  Start Your Journey
                </>
              )}
            </motion.button>
          </div>

          {/* ============ RIGHT PANEL — METRICS & PIPELINE ============ */}
          <div className="flex flex-col gap-6 lg:col-span-8 z-0 relative">

            {/* SKILL METRICS */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm tracking-widest text-gray-800 dark:text-zinc-200 uppercase">SKILL METRICS</h3>
              </div>

              <MetricsPanel values={role.metrics} />
            </div>

            {/* MASTERY PIPELINE */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm overflow-hidden">
              <h3 className="text-sm tracking-widest text-gray-800 dark:text-zinc-200 uppercase mb-8">MASTERY PIPELINE</h3>

              <div className="w-full">
                <Pipeline stage={role.stage} />
              </div>
            </div>

          </div>
        </div>
      </ContainerScroll>
    </section>
  );
}
