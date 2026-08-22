import EvolvingSystemVisual from "../../EvolvingSystemVisual";
import OceanBottom from "./OceanBottom";

interface BentoCanvasProps {
  activeState: number;
  activeEyebrow: string;
}

/**
 * The persistent "Bento" visual card on the left side of the desktop layout.
 * Houses the EvolvingSystemVisual, a dynamic state pill, the window header,
 * and the fluid ocean bottom decoration.
 */
export default function BentoCanvas({
  activeState,
  activeEyebrow,
}: BentoCanvasProps) {
  return (
    <div className="relative w-[52%] p-px transition-all duration-700">
      <div className="absolute -inset-3 rounded-[38px] bg-primary/20 blur-2xl -z-10 transition-opacity duration-700" />
      <div className="absolute -inset-[1.5px] rounded-[34px] bg-gradient-to-b from-primary/60 via-primary/20 to-primary/50 opacity-60 blur-sm transition-opacity duration-700 group-hover:opacity-100" />

      <div
        className="
          group isolate relative
          flex h-[58vh] max-h-[580px] min-h-[420px] w-full flex-col
          overflow-hidden rounded-[30px]
          border-2 border-border
          bg-card
          text-foreground
          shadow-[0_20px_60px_rgba(0,0,0,0.12)]
          dark:shadow-[0_25px_80px_rgba(0,0,0,0.8)]
          transition-all duration-700
          ease-[cubic-bezier(0.22,1,0.36,1)]
          hover:border-primary
        "
      >
        {/* Dot Grid Mesh */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.16]"
          style={{
            backgroundImage: `radial-gradient(rgb(var(--primary)) 1.5px, transparent 1.5px)`,
            backgroundSize: "22px 22px",
          }}
        />

        {/* Dynamic State Pill Badge */}
        <div className="absolute top-3.5 right-4 z-30 flex items-center gap-2 rounded-full border border-border bg-card-soft px-3.5 py-1 shadow-md backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="font-mono text-caption font-extrabold tracking-widest text-foreground">
            {activeEyebrow}
          </span>
        </div>

        {/* Top Accent Line */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-100 shadow-[0_0_10px_rgb(var(--primary))]" />

        {/* Window Header */}
        <div className="relative z-20 flex items-center justify-between border-b border-border bg-card-soft/90 px-5 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500/80 border border-red-500" />
              <span className="h-2 w-2 rounded-full bg-yellow-500/80 border border-yellow-500" />
              <span className="h-2 w-2 rounded-full bg-primary border border-primary shadow-[0_0_8px_rgba(var(--primary),0.9)]" />
            </div>
            <span className="h-3.5 w-px bg-border" />
            <span className="font-mono text-caption font-bold uppercase tracking-widest text-foreground/80">
              Roadmap Intelligence Core
            </span>
          </div>
        </div>

        {/* Canvas Viewport */}
        <div className="relative z-[2] flex h-full w-full flex-1 items-center justify-center overflow-hidden p-5">
          <EvolvingSystemVisual activeState={activeState} />
        </div>

        {/* 🌊 FLUID OCEAN BOTTOM */}
        <OceanBottom />
      </div>
    </div>
  );
}
