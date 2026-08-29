"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FiCheckCircle,
  FiTarget,
  FiCpu,
  FiZap,
  FiTrendingUp,
  FiShield,
  FiLayers,
} from "react-icons/fi";

interface NodeData {
  id: string;
  title: string;
  category: string;
  status: "verified" | "active" | "gap" | "target";
  readiness: number;
  description: string;
}

const nodes: NodeData[] = [
  {
    id: "diag",
    title: "Diagnostic Baseline",
    category: "Step 01",
    status: "verified",
    readiness: 100,
    description: "Evaluated current proficiency & mapped background knowledge",
  },
  {
    id: "gap",
    title: "Skill Gap Isolation",
    category: "Step 02",
    status: "gap",
    readiness: 45,
    description: "Isolated 3 critical prerequisite gaps before advanced modules",
  },
  {
    id: "active",
    title: "Adaptive Milestone",
    category: "Step 03",
    status: "active",
    readiness: 78,
    description: "Dynamic pathway adjusting to real-time project benchmarks",
  },
  {
    id: "proof",
    title: "Zero-Clone Proof",
    category: "Step 04",
    status: "verified",
    readiness: 94,
    description: "Production project verified with architectural breakdown",
  },
  {
    id: "target",
    title: "Target Capability Gate",
    category: "Outcome",
    status: "target",
    readiness: 92,
    description: "Job-readiness threshold validated against real requirements",
  },
];

export default function CapabilitySkillGraph() {
  const [selectedNode, setSelectedNode] = useState<NodeData>(nodes[2]);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Background ambient glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-2xl pointer-events-none" />

      {/* Main glass card container */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl transition-all duration-300">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Capability Engine v2.4
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5">
            <FiZap className="size-3 text-primary" />
            <span className="font-mono text-[11px] font-medium text-primary">
              Live Neural Graph
            </span>
          </div>
        </div>

        {/* Graph Visualizer Canvas */}
        <div className="relative py-3">
          {/* Connecting SVG lines with animated dashes */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 480 200"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#A855F7" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#22C55E" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Path connecting nodes */}
            <path
              d="M 40,100 C 120,40 180,160 260,100 C 340,40 400,100 440,100"
              stroke="url(#lineGrad)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="opacity-70 animate-[dash_20s_linear_infinite]"
            />
          </svg>

          {/* Interactive Nodes Row */}
          <div className="relative z-10 flex items-center justify-between gap-1 sm:gap-2">
            {nodes.map((node, index) => {
              const isSelected = selectedNode.id === node.id;
              let icon = <FiCpu className="size-4" />;
              let badgeColor = "bg-primary/20 text-primary border-primary/40";

              if (node.status === "verified") {
                icon = <FiCheckCircle className="size-4 text-emerald-500" />;
                badgeColor = "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
              } else if (node.status === "gap") {
                icon = <FiLayers className="size-4 text-amber-500" />;
                badgeColor = "bg-amber-500/20 text-amber-500 border-amber-500/30";
              } else if (node.status === "target") {
                icon = <FiTarget className="size-4 text-primary" />;
                badgeColor = "bg-primary/20 text-primary border-primary/40";
              }

              return (
                <motion.button
                  key={node.id}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedNode(node)}
                  className={`
                    relative flex flex-col items-center justify-center rounded-xl p-2 sm:p-2.5 transition-all bg-card shadow-sm
                    ${
                      isSelected
                        ? "border-2 border-primary shadow-[0_0_20px_rgba(159,84,247,0.35)] scale-105"
                        : "border border-border/80 hover:border-primary/50"
                    }
                  `}
                  aria-label={`Inspect ${node.title}`}
                >
                  {/* Subtle tint on top of solid background when selected */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl bg-primary/10 pointer-events-none" />
                  )}

                  <div
                    className={`relative z-10 flex size-8 sm:size-9 items-center justify-center rounded-lg border ${badgeColor}`}
                  >
                    {icon}
                  </div>
                  <span className="relative z-10 mt-1.5 font-mono text-[9px] sm:text-[10px] text-muted-foreground">
                    {node.category}
                  </span>
                  {isSelected && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute -bottom-1 size-1.5 rounded-full bg-primary z-20"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Detail Card */}
        <motion.div
          key={selectedNode.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-5 rounded-xl border border-border/80 bg-card-soft/80 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-primary font-medium">
                  {selectedNode.category}
                </span>
                <span className="text-muted-foreground/40">•</span>
                <h4 className="text-sm font-semibold text-foreground">
                  {selectedNode.title}
                </h4>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <div className="font-mono text-xs font-bold text-foreground">
                {selectedNode.readiness}%
              </div>
              <span className="font-mono text-[10px] text-muted-foreground uppercase">
                {selectedNode.status === "gap" ? "Gap Resolved" : "Readiness"}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${selectedNode.readiness}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${
                selectedNode.status === "verified"
                  ? "bg-emerald-500"
                  : selectedNode.status === "gap"
                  ? "bg-amber-500"
                  : "bg-primary"
              }`}
            />
          </div>
        </motion.div>

        {/* Footer Metrics Row */}
        <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-center font-mono">
          <div className="rounded-lg bg-card/60 p-2 border border-border/40">
            <span className="block text-[10px] text-muted-foreground uppercase">
              Target Role
            </span>
            <span className="text-xs font-semibold text-foreground">AI Engineer</span>
          </div>
          <div className="rounded-lg bg-card/60 p-2 border border-border/40">
            <span className="block text-[10px] text-muted-foreground uppercase">
              Capability Index
            </span>
            <span className="text-xs font-semibold text-primary">94.2%</span>
          </div>
          <div className="rounded-lg bg-card/60 p-2 border border-border/40">
            <span className="block text-[10px] text-muted-foreground uppercase">
              Status
            </span>
            <span className="text-xs font-semibold text-emerald-500">Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
