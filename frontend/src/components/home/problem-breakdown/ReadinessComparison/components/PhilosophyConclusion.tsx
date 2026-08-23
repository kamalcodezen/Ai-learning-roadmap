/**
 * "The Paradigm Shift" concluding card — the philosophy statement
 * about Adaptive Continuous OS vs. video watch time.
 */
export default function PhilosophyConclusion() {
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Ambient Backlight Glow */}
      <div className="pointer-events-none absolute -top-10 h-32 w-full max-w-72 rounded-full bg-primary/20 blur-[70px]" />

      {/* Interactive Core Statement Bento Card */}
      <div className="group relative max-w-2xl overflow-hidden rounded-2xl rounded-t-none border border-border/80  bg-card/60 p-7 shadow-md backdrop-blur-md transition-all duration-500 hover:border-primary/50 ">
        {/* Micro Laser Top Accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />

        {/* Stage Tag */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 font-mono text-caption font-bold uppercase tracking-widest text-primary shadow-xs">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          The Paradigm Shift
        </div>

        {/* Human-Hook Hookline */}
        <p className="text-body font-medium text-muted-foreground">
          A 100% course completion bar is just a metric.
        </p>

        <h4 className="mt-1 font-poppins text-h4 font-semibold text-foreground text-balance">
          Real engineering capability requires an{" "}
          <span className="relative inline-block font-bold text-primary">
            Adaptive Continuous OS
            <span className="absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-primary/60" />
          </span>{" "}
          that measures proof-of-work, not just video watch time.
        </h4>
      </div>
    </div>
  );
}
