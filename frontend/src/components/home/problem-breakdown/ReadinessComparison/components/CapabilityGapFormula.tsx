/**
 * The 80% ≠ 18% telemetry split console — shows the gap between
 * vanity metrics (video watch time) and actual production capability.
 */
export default function CapabilityGapFormula() {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Ambient Halo behind Terminal */}
      <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-primary/10 blur-2xl -z-10" />

      {/* Header Badge */}
      <div className="mb-6 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card-soft px-4 py-1.5 shadow-sm backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
            Empirical Reality Gap
          </span>
        </div>
      </div>

      {/* Main Telemetry Split Console */}
      <div className="relative overflow-hidden rounded-[28px] border-2 border-border bg-card p-6 md:p-8 ">
        {/* Micro Horizon Glow Accent */}
        <div className="pointer-events-none absolute inset-x-12 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

        {/* Dot-Grid Matrix Mesh */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(rgb(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        />

        <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
          {/* 🔴 Left Gauge: Illusion of Progress */}
          <div className="flex flex-col rounded-2xl border border-border/80 bg-background/50 p-5 md:p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Vanity Metrics
              </span>
              <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-red-400">
                Passive Signal
              </span>
            </div>

            <div className="mt-5 flex items-baseline justify-between">
              <div className="flex flex-col">
                <span className="font-poppins text-base font-semibold text-foreground">
                  Video Watch Time
                </span>
                <span className="text-[13px] text-muted-foreground">
                  Static playlist completion
                </span>
              </div>
              <span className="font-mono text-4xl font-bold tracking-tight text-muted-foreground/40 line-through decoration-red-500/70 decoration-2 md:text-5xl">
                80%
              </span>
            </div>

            {/* Depleted Gauge Track */}
            <div className="mt-5 space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                <div className="h-full w-[80%] rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex justify-between font-mono text-[10px] text-muted-foreground/60">
                <span>Progress bar full</span>
                <span>False confidence</span>
              </div>
            </div>
          </div>

          {/*  Center Core: Non-Equivalence Conductor */}
          <div className="flex flex-row items-center justify-center gap-4 lg:flex-col lg:gap-2">
            <div className="h-8 w-[2px] bg-gradient-to-b from-transparent via-border to-primary hidden lg:block" />

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary/40 bg-card-soft shadow-[0_0_20px_-3px_rgba(var(--primary),0.3)]">
              <span className="font-sans text-3xl font-light text-primary drop-shadow-[0_0_10px_rgb(var(--primary))]">
                ≠
              </span>
            </div>

            <div className="h-8 w-[2px] bg-gradient-to-b from-primary via-border to-transparent hidden lg:block" />
          </div>

          {/* Right Gauge: Verified Production Readiness */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border-2 border-primary/50 bg-gradient-to-b from-primary/[0.07] to-transparent p-5 md:p-6 shadow-[0_0_30px_-10px_rgba(var(--primary),0.2)] backdrop-blur-sm">
            {/* Active Pill Header */}
            <div className="flex items-center justify-between border-b border-primary/20 pb-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                True Proof-of-Work
              </span>
              <span className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Verified Core
              </span>
            </div>

            <div className="mt-5 flex items-baseline justify-between">
              <div className="flex flex-col">
                <span className="font-poppins text-base font-semibold text-foreground">
                  Production Execution
                </span>
                <span className="text-[13px] text-primary/80 font-medium">
                  Architecture & live debugging
                </span>
              </div>
              <span className="font-mono text-4xl font-extrabold tracking-tight text-foreground md:text-5xl drop-shadow-sm">
                18%
              </span>
            </div>

            {/* Real Dynamic Capacity Gauge */}
            <div className="mt-5 space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full w-[18%] rounded-full bg-primary shadow-[0_0_10px_rgb(var(--primary))]" />
              </div>
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-primary font-semibold">
                  Actual capability
                </span>
                <span className="text-muted-foreground">The unseen debt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
