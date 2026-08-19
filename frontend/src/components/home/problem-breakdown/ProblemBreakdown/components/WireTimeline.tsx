"use client";

import { motion } from "motion/react";
import { NarrativeState } from "../data/narrativeStates";
import TimelineStep from "./TimelineStep";

interface WireTimelineProps {
  states: NarrativeState[];
  activeState: number;
  onSelectState?: (index: number) => void;
}

/**
 * The right-side "electric wire" timeline on the desktop layout.
 * Displays narrative steps alongside a continuous animated wire track.
 */
export default function WireTimeline({
  states,
  activeState,
  onSelectState,
}: WireTimelineProps) {
  // Active step signal positions along wire track
  const signalTopPercentage =
    activeState === 0 ? "18%" : activeState === 1 ? "50%" : "82%";

  return (
    <div className="relative z-10 flex w-[44%] flex-col pl-4 py-4 space-y-6">
      {/* Continuous Wire Track */}
      <div className="absolute left-[39px] top-3 bottom-3 w-[2px] bg-border">
        {/* Animated Running Current Signal aligned to active step */}
        <motion.div
          className="absolute inset-x-0 h-24 -translate-y-1/2 bg-gradient-to-b from-transparent via-primary to-transparent shadow-[0_0_14px_rgb(var(--primary))]"
          animate={{ top: signalTopPercentage }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      {states.map((state, idx) => (
        <div
          key={state.id}
          className="flex w-full flex-col justify-center py-2"
        >
          <motion.div
            animate={{
              opacity: activeState === idx ? 1 : 0.45,
              x: activeState === idx ? 6 : 0,
            }}
            transition={{ duration: 0.3 }}
            onClick={() => onSelectState?.(idx)}
            className="group/step relative pl-16 cursor-pointer transition-all duration-300"
          >
            <TimelineStep state={state} isActive={activeState === idx} />
          </motion.div>
        </div>
      ))}

      {/* Wire End Glow Node */}
      <div className="absolute bottom-0 left-[39px] -translate-x-1/2 flex flex-col items-center">
        <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgb(var(--primary))]" />
      </div>
    </div>
  );
}
