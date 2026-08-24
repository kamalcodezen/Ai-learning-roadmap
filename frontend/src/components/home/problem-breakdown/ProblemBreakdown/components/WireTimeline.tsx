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

  return (
    <div className="relative z-10 flex w-[42%] flex-col pl-4 py-4 space-y-6">
      {states.map((state, idx) => (
        <div
          key={state.id}
          className="flex w-full flex-col justify-center py-2"
        >
          <motion.div
            animate={{
              opacity: activeState === idx ? 1 : 0.45,
            }}
            transition={{ duration: 0.3 }}
            onClick={() => onSelectState?.(idx)}
            className="group/step relative pl-16 cursor-pointer transition-all duration-300"
          >
            <TimelineStep 
              state={state} 
              isActive={activeState === idx} 
              isFirst={idx === 0}
              isLast={idx === states.length - 1} 
            />
          </motion.div>
        </div>
      ))}
    </div>
  );
}
