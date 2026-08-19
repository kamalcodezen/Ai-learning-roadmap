// export default function AboutPage() { return null; } 

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FiCheckCircle,
  FiTerminal,
  FiCpu,
  FiGitCommit,
  FiLayers,
  FiShield,
  FiActivity,
  FiCode,
  FiMessageSquare,
  FiZap,
  FiCheck,
  FiLock,
  FiAlertCircle,
} from "react-icons/fi";

// ১. রোল অনুযায়ী সম্পূর্ণ অডিট ও টেলিমিত্রি ডাটা
const ROLE_TELEMETRY = {
  frontend: {
    roleName: "Frontend Engineering L4",
    overallScore: 74,
    statusText: "3 PRODUCTION FIXES NEEDED",
    statusStyle: "border-amber-500/40 text-amber-400 bg-amber-500/10",
    commitHash: "SHA-256 #8f2a9c::fe04",
    diagnostics: {
      unitTests: "94.2%",
      latency: "14ms",
      aiIndependence: "86%",
    },
    subScores: [
      { name: "Knowledge Depth (Syntax & DOM)", score: 92, status: "Mastered", icon: FiCpu },
      { name: "Practical Bug Mitigation", score: 68, status: "3 Debts", icon: FiActivity },
      { name: "Production Architecture", score: 78, status: "Verified", icon: FiLayers },
      { name: "Problem Solving & Logic", score: 84, status: "Cleared", icon: FiCode },
      { name: "Technical Communication", score: 76, status: "Good", icon: FiMessageSquare },
      { name: "AI Mock Interview Score", score: 70, status: "Passed", icon: FiTerminal },
      { name: "Verifiable Public Evidence", score: 94, status: "Immutable", icon: FiGitCommit },
    ],
  },
  backend: {
    roleName: "Backend & Systems Architect",
    overallScore: 68,
    statusText: "CONCURRENCY DEBT FLAGGED",
    statusStyle: "border-blue-500/40 text-blue-400 bg-blue-500/10",
    commitHash: "SHA-256 #e3b0c4::be19",
    diagnostics: {
      unitTests: "81.0%",
      latency: "38ms",
      aiIndependence: "78%",
    },
    subScores: [
      { name: "Knowledge Depth (SQL & OS)", score: 88, status: "Mastered", icon: FiCpu },
      { name: "Practical Bug Mitigation", score: 60, status: "High Debt", icon: FiActivity },
      { name: "Production Architecture", score: 72, status: "Verified", icon: FiLayers },
      { name: "Problem Solving & Logic", score: 75, status: "Stable", icon: FiCode },
      { name: "Technical Communication", score: 65, status: "Average", icon: FiMessageSquare },
      { name: "AI Mock Interview Score", score: 62, status: "Passed", icon: FiTerminal },
      { name: "Verifiable Public Evidence", score: 82, status: "Immutable", icon: FiGitCommit },
    ],
  },
  fullstack: {
    roleName: "Full-Stack Product Architect",
    overallScore: 89,
    statusText: "TOP 2% PRODUCTION READY",
    statusStyle: "border-primary/50 text-primary bg-primary/10",
    commitHash: "SHA-256 #9f86d0::fs92",
    diagnostics: {
      unitTests: "98.8%",
      latency: "11ms",
      aiIndependence: "94%",
    },
    subScores: [
      { name: "Knowledge Depth (E2E Stack)", score: 96, status: "Elite", icon: FiCpu },
      { name: "Practical Bug Mitigation", score: 88, status: "Elite", icon: FiActivity },
      { name: "Production Architecture", score: 90, status: "Verified", icon: FiLayers },
      { name: "Problem Solving & Logic", score: 92, status: "Cleared", icon: FiCode },
      { name: "Technical Communication", score: 85, status: "Articulate", icon: FiMessageSquare },
      { name: "AI Mock Interview Score", score: 89, status: "Cleared", icon: FiTerminal },
      { name: "Verifiable Public Evidence", score: 95, status: "Immutable", icon: FiGitCommit },
    ],
  },
};

// ২. ৫-লেভেল ক্যাপাবিলিটি ফ্রেমওয়ার্ক
const CAPABILITY_STAIRS = [
  { level: "01", tag: "KNOW", title: "Syntax & Complexity", desc: "3-minute rapid quizzes testing fundamentals vs memorization." },
  { level: "02", tag: "CAN DO", title: "Broken Sandbox Labs", desc: "Live production breakages you must debug in a sandboxed repo." },
  { level: "03", tag: "EXPLAIN", title: "AI Mock Interview", desc: "Interactive AI panel testing architectural trade-off reasoning." },
  { level: "04", tag: "BUILD", title: "Production Repos", desc: "Clean architecture projects pushed to GitHub with CI/CD." },
  { level: "05", tag: "PROVE", title: "Cryptographic Telemetry", desc: "Public proof link with immutable test logs and deployment URLs." },
];

export default function CareerReadinessTwin() {
  const [selectedRole, setSelectedRole] = useState<"frontend" | "backend" | "fullstack">("frontend");
  const data = ROLE_TELEMETRY[selectedRole];

  // সার্কুলার প্রোগ্রেস ক্যালকুলেশন
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.overallScore / 100) * circumference;

  return (
    <section className="relative w-full overflow-hidden bg-background py-24 lg:py-32">
      {/* Background Neon Ambient Mesh */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[850px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px] -z-10" />

      <div className="container-custom">
        
        {/* =========================================================
            সেকশন হেডার
        ========================================================== */}
        <div className="mb-14 max-w-3xl text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card-soft px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-primary mb-4 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            04 // Core Diagnostic Engine
          </div>

          <h2 className="font-poppins text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground leading-tight">
            The Digital Twin of Your{" "}
            <span className="font-serif italic font-normal text-muted-foreground">Engineering</span>{" "}
            <span className="font-medium underline decoration-primary/50 underline-offset-8">
              Readiness
            </span>
          </h2>

          <p className="section-description mt-4 text-base md:text-lg">
            Companies do not hire developers who merely watch playlists. They hire engineers with cryptographically proven production capacity.
          </p>
        </div>

        {/* =========================================================
            ২-কলাম আর্কিটেকচার গ্রিড
        ========================================================== */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          
          {/* বাম পাশ: ৫-স্তরের ফ্রেমওয়ার্ক ও অ্যান্টি-চিট ট্রাস্ট */}
          <div className="flex flex-col space-y-6 lg:col-span-5">
            <div className="dashboard-card relative p-6 md:p-7 rounded-2xl border-border/80">
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-5">
                <span className="font-mono text-xs uppercase tracking-wider text-foreground font-bold flex items-center gap-2">
                  <FiTerminal className="text-primary" /> The 5-Layer Stair
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">AUTO-VERIFIED</span>
              </div>

              <div className="relative space-y-4 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-gradient-to-b before:from-border before:via-primary/50 before:to-primary">
                {CAPABILITY_STAIRS.map((step) => (
                  <div key={step.level} className="relative flex items-start gap-3.5 pl-1 group">
                    <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card font-mono text-[10px] font-bold text-foreground group-hover:border-primary group-hover:text-primary transition-all">
                      {step.level}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-primary font-bold">[{step.tag}]</span>
                        <h4 className="font-poppins text-xs font-semibold text-foreground">{step.title}</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-Plagiarism Trust Box */}
            <div className="soft-card flex items-center gap-3 p-4 rounded-xl border-border">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FiShield className="text-lg" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground">Anti-Plagiarism & AI Copilot Index</p>
                <p className="text-muted-foreground text-[11px]">Validates live debugging keystrokes to ensure 100% human authorship.</p>
              </div>
            </div>
          </div>

          {/* ডান পাশ: সাইবার ডায়াগনস্টিক টার্মিনাল ও ৭টি সাব-স্কোর */}
          <div className="dashboard-card relative p-6 md:p-8 rounded-3xl border-2 border-border/90 lg:col-span-7 shadow-2xl">
            
            {/* টার্মিনাল হেডার ও রোল ফিল্টার */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                </div>
                <span className="font-mono text-xs text-muted-foreground ml-2">twin_terminal::telemetry</span>
              </div>

              {/* রোল সুইচিং বাটন */}
              <div className="flex rounded-xl bg-card-soft p-1 border border-border">
                {(["frontend", "backend", "fullstack"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`rounded-lg px-3 py-1.5 font-mono text-[11px] font-bold uppercase transition-all ${
                      selectedRole === r
                        ? "bg-card text-foreground shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* সেন্ট্রাল স্কোর ডায়াল ও স্পেক্স */}
            <div className="my-6 rounded-2xl border border-border/60 bg-card-soft/50 p-5 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative flex items-center justify-center">
                <svg className="h-28 w-28 -rotate-90 transform">
                  <circle cx="56" cy="56" r={radius} className="stroke-muted/40" strokeWidth="7" fill="transparent" />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r={radius}
                    className="stroke-primary"
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <motion.span
                    key={data.overallScore}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-mono text-2xl font-extrabold text-foreground"
                  >
                    {data.overallScore}
                  </motion.span>
                  <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">/ 100</span>
                </div>
              </div>

              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <h3 className="font-poppins text-base font-bold text-foreground">{data.roleName}</h3>
                <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${data.statusStyle}`}>
                  <FiActivity /> {data.statusText}
                </span>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 font-mono text-[10px] text-muted-foreground pt-1">
                  <span>Unit Tests: <strong className="text-foreground">{data.diagnostics.unitTests}</strong></span>
                  <span>Trace: <strong className="text-primary">{data.diagnostics.latency}</strong></span>
                  <span>AI Independence: <strong className="text-foreground">{data.diagnostics.aiIndependence}</strong></span>
                </div>
              </div>
            </div>

            {/* ৭টি সাব-স্কোর মেট্রিক্স লিস্ট */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                <span>7-SUB SCORE VECTOR MATRIX</span>
                <span>CONFIDENCE</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedRole}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2.5"
                >
                  {data.subScores.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <item.icon className="text-primary text-xs" />
                          <span className="text-foreground text-[11px]">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground">[{item.status}]</span>
                          <span className="font-mono font-bold text-foreground text-[11px]">{item.score}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="h-full rounded-full bg-primary"
                          style={{ boxShadow: "0 0 8px rgba(206, 255, 31, 0.4)" }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ফুটার ক্রিপ্টোগ্রাফিক প্রুফ */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4 font-mono text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-primary" /> IMMUTABLE AUDIT LEDGER
              </span>
              <span className="rounded bg-card-soft px-2 py-0.5 font-bold text-primary border border-border">
                {data.commitHash}
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}