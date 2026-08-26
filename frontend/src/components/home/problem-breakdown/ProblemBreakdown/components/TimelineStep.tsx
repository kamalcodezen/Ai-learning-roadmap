import { motion } from "motion/react";
import { NarrativeState } from "../data/narrativeStates";

interface TimelineStepProps {
  state: NarrativeState;
  isActive: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

/**
 * A single step in the wire timeline — the pin node + text block.
 */
export default function TimelineStep({ state, isActive, isFirst, isLast }: TimelineStepProps) {
  return (
    <>
      {/* Track segment to next dot */}
      {!isLast && (
        <div 
          className="absolute left-[23px] top-[34px] w-[2px] bg-border z-0" 
          style={{ height: 'calc(100% + 40px)' }} 
        />
      )}

      {/* Pin Node */}
      <div
        className={`
          absolute left-3.5 top-6 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200 z-20
          ${
            isActive
              ? "border-brand bg-background shadow-[0_0_12px_rgba(159,84,247,0.4)] dark:border-primary dark:shadow-[0_0_12px_rgb(var(--primary))]"
              : "border-border bg-card-soft"
          }
        `}
      >
        <span
          className={`
            h-2 w-2 rounded-full transition-all duration-200
            ${
              isActive
                ? "bg-brand scale-110 shadow-[0_0_6px_rgba(159,84,247,0.4)] dark:bg-primary dark:shadow-[0_0_6px_rgb(var(--primary))]"
                : "bg-muted-foreground/50"
            }
          `}
        />
      </div>

      {/* Animated Wire Signal attached to the active step */}
      {isActive && (
        <motion.div
          layoutId="activeWireSignal"
            className={`
            absolute left-[24px] w-[2px] -translate-x-1/2 shadow-[0_0_14px_rgba(159,84,247,0.4)] dark:shadow-[0_0_14px_rgb(var(--primary))] z-10
            ${isFirst 
              ? 'top-[34px] h-12 bg-gradient-to-b from-brand to-transparent dark:from-primary dark:to-transparent' 
              : isLast
                ? 'top-[34px] h-12 -translate-y-full bg-gradient-to-t from-brand to-transparent dark:from-primary dark:to-transparent'
                : 'top-[34px] h-24 -translate-y-1/2 bg-gradient-to-b from-transparent via-brand to-transparent dark:from-transparent dark:via-primary dark:to-transparent'
            }
          `}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      )}

      {/* Compact Text Block */}
      <div className={`space-y-1 transition-transform duration-300 ${isActive ? 'translate-x-1.5' : 'translate-x-0'}`}>
        <div className="flex items-center gap-2">
          <span
            className={`
              font-mono text-caption font-extrabold uppercase tracking-widest transition-colors duration-200
              ${
                isActive
                  ? "text-brand dark:text-primary dark:drop-shadow-[0_0_6px_rgba(var(--primary),0.7)]"
                  : "text-muted-foreground"
              }
            `}
          >
            {state.eyebrow}
          </span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span className="font-mono text-caption font-bold uppercase tracking-wider text-muted-foreground">
            {state.tag}
          </span>
        </div>

        <h3
          className={`
            font-poppins text-h4 font-semibold tracking-tight transition-colors duration-200
            ${
              isActive
                ? "text-brand dark:text-foreground drop-shadow-sm"
                : "text-foreground/60"
            }
          `}
        >
          {state.title}
        </h3>

        <p
          className={`
            max-w-md text-small font-normal transition-colors duration-200
            ${
              isActive
                ? "text-foreground dark:text-foreground/90 font-medium"
                : "text-muted-foreground"
            }
          `}
        >
          {state.description}
        </p>
      </div>
    </>
  );
}
