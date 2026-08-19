import { NarrativeState } from "../data/narrativeStates";

interface TimelineStepProps {
  state: NarrativeState;
  isActive: boolean;
}

/**
 * A single step in the wire timeline — the pin node + text block.
 */
export default function TimelineStep({ state, isActive }: TimelineStepProps) {
  return (
    <>
      {/* Pin Node */}
      <div
        className={`
          absolute left-[18px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200
          ${
            isActive
              ? "border-primary bg-background shadow-[0_0_12px_rgb(var(--primary))]"
              : "border-border bg-card-soft"
          }
        `}
      >
        <span
          className={`
            h-2 w-2 rounded-full transition-all duration-200
            ${
              isActive
                ? "bg-primary scale-110 shadow-[0_0_6px_rgb(var(--primary))]"
                : "bg-muted-foreground/50"
            }
          `}
        />
      </div>

      {/* Compact Text Block */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={`
              font-mono text-[10.5px] font-extrabold uppercase tracking-[0.16em] transition-colors duration-200
              ${
                isActive
                  ? "text-primary drop-shadow-[0_0_6px_rgba(var(--primary),0.7)]"
                  : "text-muted-foreground"
              }
            `}
          >
            {state.eyebrow}
          </span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
            {state.tag}
          </span>
        </div>

        <h3
          className={`
            font-poppins text-[18px] font-semibold leading-snug tracking-tight transition-colors duration-200
            ${
              isActive
                ? "text-foreground drop-shadow-sm"
                : "text-foreground/60"
            }
          `}
        >
          {state.title}
        </h3>

        <p
          className={`
            max-w-[400px] text-[13px] font-normal leading-relaxed transition-colors duration-200
            ${
              isActive
                ? "text-foreground/90 font-medium"
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
