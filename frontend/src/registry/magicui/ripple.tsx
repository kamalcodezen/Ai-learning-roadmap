"use client";

import { cn } from "@/src/utils/cn";

interface RippleProps extends React.HTMLAttributes<HTMLDivElement> {
  numCircles?: number;
}

/**
 * Breathing ripple: rings never die and restart — they continuously
 * swell (scale up), shrink (scale down), and swell again forever.
 * Rings are large (% of the container) with a phase offset each, so the
 * pulse reads as a wave passing through the cluster.
 */
export function Ripple({ className, numCircles = 4 }: RippleProps) {
  const PULSE_DURATION = 6; // s — one full big→small→big cycle
  const PHASE_STEP = 1.2; // s — negative delay offsets each ring's phase

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]",
        className,
      )}
    >
      {Array.from({ length: numCircles }).map((_, i) => {
        const size = Math.max(76 - i * 18, 10); // % of container, largest first

        return (
          <span
            key={i}
            className="absolute rounded-full animate-ripple"
            style={{
              width: `${size}%`,
              height: `${size}%`,
              top: "50%",
              left: "50%",
              backgroundColor: "currentColor",
              opacity: 0.22 + i * 0.09, // outer rings fainter, core brighter
              animationDelay: `-${i * PHASE_STEP}s`,
              animationDuration: `${PULSE_DURATION}s`,
              transform: "translate(-50%, -50%) scale(1)",
            }}
          />
        );
      })}
    </div>
  );
}
