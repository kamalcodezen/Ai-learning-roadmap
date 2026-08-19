import { motion } from "motion/react";
import { NarrativeState } from "../data/narrativeStates";
import TimelineStep from "./TimelineStep";

interface WireTimelineProps {
  states: NarrativeState[];
  activeState: number;
}

/**
 * The right-side "electric wire" timeline on the desktop layout.
 * Displays narrative steps alongside a continuous animated wire track.
 */
export default function WireTimeline({
  states,
  activeState,
}: WireTimelineProps) {
  return (
    <div className="relative z-10 flex w-[44%] flex-col pl-4 pt-4 pb-12 space-y-6">
      {/*  Continuous Wire Track - Extends all the way to the bottom */}
      <div className="absolute left-[39px] top-3 bottom-0 w-[2px] bg-border">
        {/* Animated Running Current Signal */}
        <div className="anim-wire-signal absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-primary to-transparent shadow-[0_0_12px_rgb(var(--primary))]" />

        {/* Bottom Fade Out Effect into next section */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-background" />
      </div>

      {states.map((state, idx) => (
        <div
          key={state.id}
          className="flex w-full flex-col justify-center py-3"
        >
          <motion.div
            initial={{ opacity: 0.4 }}
            whileInView={{ opacity: 1 }}
            viewport={{ margin: "-25% 0px -25% 0px" }}
            transition={{ duration: 0.25 }}
            className="group/step relative pl-16 transition-all duration-200"
          >
            <TimelineStep state={state} isActive={activeState === idx} />
          </motion.div>
        </div>
      ))}

      {/*  Wire End Glow Node */}
      <div className="absolute bottom-0 left-[39px] -translate-x-1/2 flex flex-col items-center">
        <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgb(var(--primary))]" />
      </div>
    </div>
  );
}
