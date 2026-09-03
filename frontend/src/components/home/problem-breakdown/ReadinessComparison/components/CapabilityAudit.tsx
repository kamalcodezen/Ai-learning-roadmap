import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedButton from "./AnimatedButton";
import { proofPillars } from "../data/capabilities";

/* ═══════════════════════════════════════════════════════════════
   SVG-BASED DYNAMIC VISUALS
   Stroke outlines & paths use FOREGROUND (dark in light mode,
   light in dark mode) for structure visibility.
   Solid fill dots use PRIMARY (lime) for brand accent only.
   ═══════════════════════════════════════════════════════════════ */

const VISUAL_SIZE = 220;
const PRIMARY = "rgb(var(--primary))";
const FOREGROUND = "rgb(var(--foreground))";

/** BUILD — Nodes assemble into a connected architecture graph */
function BuildVisual() {
  const nodes = [
    { x: 110, y: 30 },
    { x: 40, y: 80 },
    { x: 180, y: 80 },
    { x: 70, y: 150 },
    { x: 150, y: 150 },
    { x: 110, y: 200 },
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [1, 2],
  ];

  return (
    <svg viewBox={`0 0 ${VISUAL_SIZE} ${VISUAL_SIZE}`} className="w-full h-full" fill="none">
      {/* Edges — structural lines use foreground */}
      {edges.map(([a, b], i) => (
        <motion.line
          key={`edge-${i}`}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke={FOREGROUND}
          strokeWidth="3"
          strokeOpacity="0.2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
        />
      ))}
      {/* Nodes — outlines use foreground, solid inner dots use primary */}
      {nodes.map((n, i) => (
        <motion.g key={`node-${i}`}>
          <motion.circle
            cx={n.x} cy={n.y} r="12"
            fill="none"
            stroke={FOREGROUND}
            strokeWidth="3"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
          />
          <motion.circle
            cx={n.x} cy={n.y} r="4"
            fill={PRIMARY}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 + 0.15, type: "spring" }}
          />
        </motion.g>
      ))}
      {/* Pulsing glow on center */}
      <motion.circle
        cx={110} cy={115} r="30"
        fill={PRIMARY}
        opacity="0"
        animate={{ opacity: [0, 0.08, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
    </svg>
  );
}

/** SOLVE — A broken path finds an alternate route to reach a target */
function SolveVisual() {
  return (
    <svg viewBox={`0 0 ${VISUAL_SIZE} ${VISUAL_SIZE}`} className="w-full h-full" fill="none">
      {/* Broken direct path (X'd out) */}
      <motion.path
        d="M 30 110 L 100 110"
        stroke="rgb(239 68 68)"
        strokeWidth="3"
        strokeDasharray="6 5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      />
      {/* X mark on break */}
      <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}>
        <line x1="95" y1="100" x2="108" y2="120" stroke="rgb(239 68 68)" strokeWidth="3.5" />
        <line x1="108" y1="100" x2="95" y2="120" stroke="rgb(239 68 68)" strokeWidth="3.5" />
      </motion.g>

      {/* Alternate solution path — structural line uses foreground */}
      <motion.path
        d="M 30 110 C 50 110, 60 50, 110 40 C 160 30, 170 70, 190 110"
        stroke={FOREGROUND}
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.6, duration: 1.2, ease: "easeInOut" }}
      />

      {/* Decision fork dots — solid fills use primary */}
      {[
        { x: 60, y: 70 },
        { x: 110, y: 40 },
        { x: 155, y: 55 },
      ].map((p, i) => (
        <motion.circle
          key={`fork-${i}`}
          cx={p.x} cy={p.y} r="5"
          fill={PRIMARY}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 + i * 0.2, type: "spring" }}
        />
      ))}

      {/* Start node — outline foreground, fill primary */}
      <motion.circle cx="30" cy="110" r="10" fill="none" stroke={FOREGROUND} strokeWidth="3"
        initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.1 }} />
      <motion.circle cx="30" cy="110" r="4" fill={PRIMARY}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} />

      {/* Target node — outline foreground, fill primary */}
      <motion.circle cx="190" cy="110" r="12" fill="none" stroke={FOREGROUND} strokeWidth="3"
        initial={{ scale: 0 }} animate={{ scale: 1, opacity: 0.7 }} transition={{ delay: 1.6, type: "spring" }} />
      <motion.circle cx="190" cy="110" r="5" fill={PRIMARY}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.7, type: "spring" }} />

      {/* Success pulse — solid accent */}
      <motion.circle cx="190" cy="110" r="20" fill={PRIMARY} opacity="0"
        animate={{ opacity: [0, 0.12, 0], scale: [0.8, 1.2, 0.8] }}
        transition={{ delay: 1.8, duration: 2, repeat: Infinity }} />

      {/* Labels — use foreground for readability */}
      <motion.text x="82" y="142" fill="rgb(239 68 68)" fontSize="10" fontWeight="bold" fontFamily="var(--font-poppins)"
        initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.5 }}>
        BLOCKED
      </motion.text>

      <motion.text x="168" y="142" fill={FOREGROUND} fontSize="10" fontWeight="bold" fontFamily="var(--font-poppins)"
        initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 1.8 }}>
        SOLVED
      </motion.text>
    </svg>
  );
}

/** EXPLAIN — A single output expands to reveal layered reasoning annotations */
function ExplainVisual() {
  const layers = [
    { r: 20, label: "Output", opacity: 1 },
    { r: 42, label: "Logic", opacity: 0.5 },
    { r: 64, label: "Reasoning", opacity: 0.3 },
    { r: 86, label: "Trade-offs", opacity: 0.18 },
  ];

  return (
    <svg viewBox={`0 0 ${VISUAL_SIZE} ${VISUAL_SIZE}`} className="w-full h-full" fill="none">
      {/* Expanding reasoning rings — outlines use foreground */}
      {layers.map((l, i) => (
        <motion.g key={`layer-${i}`}>
          <motion.circle
            cx="110" cy="110" r={l.r}
            stroke={FOREGROUND}
            strokeWidth={i === 0 ? "3" : "2"}
            strokeDasharray={i > 0 ? "4 4" : undefined}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: l.opacity }}
            transition={{ delay: i * 0.25, duration: 0.6, type: "spring" }}
          />
          {i > 0 && (
            <motion.text
              x={110 + l.r - 4}
              y={110 - 6}
              fill={FOREGROUND}
              fontSize="9"
              fontWeight="bold"
              fontFamily="var(--font-poppins)"
              textAnchor="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: i * 0.25 + 0.3 }}
            >
              {l.label}
            </motion.text>
          )}
        </motion.g>
      ))}
      {/* Center core node — solid fill primary */}
      <motion.circle
        cx="110" cy="110" r="9"
        fill={PRIMARY}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      />
      {/* Annotation connector lines — structural foreground */}
      {[45, 135, 225, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 110 + Math.cos(rad) * 22;
        const y1 = 110 + Math.sin(rad) * 22;
        const x2 = 110 + Math.cos(rad) * 82;
        const y2 = 110 + Math.sin(rad) * 82;
        return (
          <motion.line
            key={`ann-${i}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={FOREGROUND}
            strokeWidth="2"
            strokeOpacity="0.15"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
          />
        );
      })}
    </svg>
  );
}

/** PROVE — Multiple evidence points converge into a verified skill graph */
function ProveVisual() {
  const evidenceNodes = [
    { x: 40, y: 40, label: "Project" },
    { x: 180, y: 40, label: "Assessment" },
    { x: 40, y: 180, label: "Decision" },
    { x: 180, y: 180, label: "Outcome" },
  ];
  const center = { x: 110, y: 110 };

  return (
    <svg viewBox={`0 0 ${VISUAL_SIZE} ${VISUAL_SIZE}`} className="w-full h-full" fill="none">
      {/* Connection lines — structural foreground */}
      {evidenceNodes.map((n, i) => (
        <motion.line
          key={`proof-edge-${i}`}
          x1={n.x} y1={n.y}
          x2={center.x} y2={center.y}
          stroke={FOREGROUND}
          strokeWidth="3"
          strokeOpacity="0.15"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }}
        />
      ))}
      {/* Cross-connections — structural foreground */}
      {[
        [0, 1], [1, 3], [3, 2], [2, 0],
      ].map(([a, b], i) => (
        <motion.line
          key={`cross-${i}`}
          x1={evidenceNodes[a].x} y1={evidenceNodes[a].y}
          x2={evidenceNodes[b].x} y2={evidenceNodes[b].y}
          stroke={FOREGROUND}
          strokeWidth="2"
          strokeOpacity="0.08"
          strokeDasharray="5 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.0 + i * 0.1, duration: 0.5 }}
        />
      ))}
      {/* Evidence nodes — outlines foreground, solid fills primary */}
      {evidenceNodes.map((n, i) => (
        <motion.g key={`proof-node-${i}`}>
          <motion.circle
            cx={n.x} cy={n.y} r="14"
            fill="none"
            stroke={FOREGROUND}
            strokeWidth="3"
            initial={{ scale: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ delay: i * 0.12, type: "spring", stiffness: 200 }}
          />
          <motion.circle
            cx={n.x} cy={n.y} r="5"
            fill={PRIMARY}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.12 + 0.1, type: "spring" }}
          />
          <motion.text
            x={n.x}
            y={n.y + (n.y < 110 ? -22 : 28)}
            fill={FOREGROUND}
            fontSize="9"
            fontWeight="bold"
            fontFamily="var(--font-poppins)"
            textAnchor="middle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: i * 0.12 + 0.3 }}
          >
            {n.label}
          </motion.text>
        </motion.g>
      ))}
      {/* Center verified node — outline foreground, fill primary */}
      <motion.circle
        cx={center.x} cy={center.y} r="18"
        fill="none"
        stroke={FOREGROUND}
        strokeWidth="4"
        initial={{ scale: 0 }}
        animate={{ scale: 1, opacity: 0.7 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 150 }}
      />
      <motion.circle
        cx={center.x} cy={center.y} r="7"
        fill={PRIMARY}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.3, type: "spring" }}
      />
      {/* Verified pulse — solid accent */}
      <motion.circle
        cx={center.x} cy={center.y} r="26"
        fill={PRIMARY}
        opacity="0"
        animate={{ opacity: [0, 0.1, 0], scale: [0.9, 1.3, 0.9] }}
        transition={{ delay: 1.5, duration: 2.5, repeat: Infinity }}
      />
      <motion.text
        x={center.x}
        y={center.y + 38}
        fill={FOREGROUND}
        fontSize="10"
        fontFamily="var(--font-poppins)"
        fontWeight="bold"
        textAnchor="middle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.5 }}
      >
        VERIFIED
      </motion.text>
    </svg>
  );
}

/** Switcher component for dynamic visuals */
function DynamicVisual({ id }: { id: string }) {
  switch (id) {
    case "build": return <BuildVisual />;
    case "solve": return <SolveVisual />;
    case "explain": return <ExplainVisual />;
    case "prove": return <ProveVisual />;
    default: return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — STRICT 4-CARD BENTO GRID
   Grid: 12 columns
   Row 1: Card 1 (4 col) + Card 2 (8 col)
   Row 2: Card 3 (4 col) + Card 4 (8 col)

   Light-mode discipline:
   - Section canvas: bg-muted (off-white/grey)
   - Cards: bg-background (pure white) with border-2 + shadow
   - Lime restricted to solid pill bg + solid SVG fills
   - All text uses foreground/muted-foreground variables
   ═══════════════════════════════════════════════════════════════ */

export default function CapabilityAudit() {
  const [activeCap, setActiveCap] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleTabChange = useCallback((idx: number) => {
    if (idx === activeCap) return;
    setDirection(idx > activeCap ? 1 : -1);
    setActiveCap(idx);
  }, [activeCap]);

  const pillar = proofPillars[activeCap];

  const contentVariants = {
    enter: (dir: number) => ({ x: dir * 16, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -16, opacity: 0 }),
  };

  return (
    <div id="readiness-comparison" className="mt-16 w-full global-container">
      {/* ── SECTION HEADER & NAVIGATION ── */}
      <div className="text-center mb-10 flex flex-col items-center gap-2">
        <span className="section-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
          THE 4 PROOF PILLARS
        </span>
        
        <h4 className="section-title font-bold">
          Progress Is <span className="text-brand">
              not Proof
              </span>
        </h4>
        
        <p className="section-subtitle md:whitespace-nowrap">
          AI Pather turns what you learn into visible evidence of what you can actually do
        </p>

        {/* ── PILL NAVIGATION (sole controller) ── */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center place-items-center gap-3 md:gap-4 pt-2 mx-auto w-full max-w-[320px] sm:max-w-none">
        {proofPillars.map((item, idx) => (
          <AnimatedButton
            key={item.id}
            text={item.title}
            onClick={() => handleTabChange(idx)}
            isActive={activeCap === idx}
          />
        ))}
        </div>
      </div>

      {/* ── BENTO CANVAS — muted background lifts cards ── */}
      <div className="bg-muted/50 rounded-2xl p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">

          {/* ━━━ CARD 1: THE OLD WAY (top-left, 4 col) ━━━ */}
          <div className="group md:col-span-4 order-3 md:order-1 rounded-md border border-primary/15 bg-[linear-gradient(165deg,#faf5ff_0%,#ffffff_55%,#fcfaff_100%)] p-6 flex flex-col justify-between relative overflow-hidden min-h-[200px] shadow-sm dark:border-primary/20 dark:bg-[linear-gradient(165deg,#1c0e2e_0%,#0d0715_55%,#160b26_100%)]">
            {/* corner blush — top-right + bottom-left */}
            <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-tr-full bg-gradient-to-tl from-primary/20 to-blue-500/10" />
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={pillar.id + "-old"}
                custom={direction}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  <span className="inline-block font-poppins text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-foreground/60 mb-3 border-2 border-border bg-muted px-2.5 py-1 rounded-md">
                    {pillar.oldWayLabel}
                  </span>
                  <h5 className="font-poppins text-base md:text-lg font-bold text-foreground mb-2 tracking-tight">
                    {pillar.oldWayHeadline}
                  </h5>
                  <p className="font-poppins text-sm text-foreground/70 leading-relaxed">
                    {pillar.oldWayDescription}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t-2 border-border">
                  <span className="font-poppins text-[10px] text-foreground/50 uppercase tracking-widest font-extrabold">
                    {pillar.oldWaySignal}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ━━━ CARD 2: HERO VISUAL (top-right, 8 col) ━━━ */}
          <div className="group md:col-span-8 order-1 md:order-2 rounded-md border border-primary/20 bg-[radial-gradient(130%_130%_at_88%_0%,#f7f0ff_0%,#fcf8ff_45%,#ffffff_100%)] p-6 md:p-8 flex flex-col relative overflow-hidden min-h-[320px] shadow-md dark:border-primary/20 dark:bg-[radial-gradient(130%_130%_at_88%_0%,#26113c_0%,#150b24_50%,#0b0613_100%)]">
            {/* primary glow — bottom-left + top-right */}
            <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-tr-full bg-gradient-to-tl from-primary/20 to-purple-500/10" />
            <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-primary/20 to-purple-500/10" />
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={pillar.id + "-hero"}
                custom={direction}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col md:flex-row gap-6 w-full h-full relative z-10"
              >
                {/* Text side */}
                <div className="font-poppins flex-1 flex flex-col justify-center min-w-0">
                  <span className="inline-block font-poppins text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-foreground/50 mb-3">
                    AI PATHER / PROOF PILLAR
                  </span>
                  <h3 className="font-poppins text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 tracking-tight leading-tight">
                    {pillar.mainHeadline}
                  </h3>
                  <p className="font-poppins text-sm md:text-base text-foreground/70 leading-relaxed max-w-md">
                    {pillar.mainDescription}
                  </p>
                  <div className="mt-6 font-poppins text-xs text-foreground/40 font-extrabold uppercase tracking-widest">
                    {pillar.progressText}
                  </div>
                </div>

                {/* SVG visual side */}
                <div className="flex-1 min-h-[180px] md:min-h-0 w-full flex items-center justify-center">
                  <div className="w-full max-w-[220px] aspect-square">
                    <DynamicVisual id={pillar.id} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ━━━ CARD 3: WHAT THIS PROVES (bottom-left, 4 col) ━━━ */}
          <div className="group md:col-span-4 order-4 md:order-3 rounded-md border border-primary/15 bg-[linear-gradient(200deg,#f8f2ff_0%,#ffffff_55%,#fcfaff_100%)] p-6 flex flex-col relative overflow-hidden min-h-[160px] shadow-sm dark:border-primary/20 dark:bg-[linear-gradient(200deg,#190d2b_0%,#0b0613_55%,#120a20_100%)]">
            {/* corner glow — top-left + bottom-right */}
            <div className="pointer-events-none absolute top-0 left-0 h-24 w-24 rounded-br-full bg-gradient-to-bl from-primary/20 to-pink-500/10" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 rounded-tl-full bg-gradient-to-tr from-primary/20 to-pink-500/10" />
            <h5 className="font-poppins text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-foreground/50 mb-5">
              WHAT THIS PROVES
            </h5>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={pillar.id + "-evidence"}
                custom={direction}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col gap-3 flex-1"
              >
                {pillar.evidenceSignals.map((signal, i) => (
                  <motion.div
                    key={signal}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm text-foreground/80 font-semibold">{signal}</span>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ━━━ CARD 4: WHY THIS MATTERS (bottom-right, 8 col) ━━━ */}
          <div className="group md:col-span-8 order-5 md:order-4 rounded-md border border-primary/15 bg-[linear-gradient(165deg,#f5edff_0%,#ffffff_55%,#faf6ff_100%)] p-6 md:p-8 flex items-center relative overflow-hidden min-h-[100px] shadow-sm dark:border-primary/20 dark:bg-[linear-gradient(165deg,#180d29_0%,#0b0613_55%,#130a22_100%)]">
            <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-r-full bg-primary" />
            {/* corner glow — bottom-right + top-left */}
            <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 rounded-tl-full bg-gradient-to-tr from-primary/20 to-indigo-500/10" />
            <div className="pointer-events-none absolute top-0 left-0 h-24 w-24 rounded-br-full bg-gradient-to-bl from-primary/20 to-indigo-500/10" />
            <div className="pl-5 md:pl-7 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 w-full">
              <span className="font-poppins text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-foreground/50 flex-shrink-0">
                WHY THIS MATTERS
              </span>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.p
                  key={pillar.id + "-takeaway"}
                  custom={direction}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="font-poppins text-base md:text-lg font-semibold text-foreground"
                >
                  {pillar.takeaway}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
