import EvolvingSystemVisual from "../../EvolvingSystemVisual";
import OceanBottom from "./OceanBottom";
import { WarpBackground } from "@/src/components/ui/warp-background";

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
    <div 
      className="relative w-[52%] transition-all duration-700"
      style={{ '--primary': '238 171 255', '--accent': '238 171 255' } as React.CSSProperties}
    >
      <div
        className="
          group isolate relative
          flex h-[58vh] max-h-[580px] min-h-[420px] w-full flex-col
          rounded-[30px]
          border-4 border-brand
          bg-brand/30
          transition-all duration-700
          ease-[cubic-bezier(0.22,1,0.36,1)]
        "
      >
        {/* MacBook Window Controls & Header Info */}
        <div className="flex items-center justify-between px-6 pb-3 pt-4 shrink-0 bg-brand/20">
          {/* Left: Window Controls + Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-foreground hidden sm:block">
              Roadmap Intelligence Core
            </span>
          </div>

          {/* Right: Dynamic Pill Badge */}
          <div className="flex items-center gap-2 rounded-full border border-[#3F3F46] bg-[#27272A] px-3 py-0.5 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]" />
            </span>
            <span className="font-mono text-[10px] font-extrabold tracking-widest text-zinc-100 uppercase">
              {activeEyebrow}
            </span>
          </div>
        </div>

        {/* Inner Content Frame */}
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-b-[26px] rounded-t-none bg-card text-foreground">
        
        {/* Full-width WarpBackground */}
        <WarpBackground className="absolute inset-0 size-full border-none p-0 rounded-none bg-transparent z-0" />
        {/* Dot Grid Mesh */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08] dark:hidden"
          style={{
            backgroundImage: `radial-gradient(rgb(var(--primary)) 1.5px, transparent 1.5px)`,
            backgroundSize: "22px 22px",
          }}
        />


        {/* Canvas Viewport */}
        <div className="relative z-[2] flex h-full w-full flex-1 items-center justify-center overflow-hidden p-5">
          <EvolvingSystemVisual activeState={activeState} />
        </div>

        {/* 🌊 FLUID OCEAN BOTTOM */}
        <OceanBottom />
        </div>
      </div>
    </div>
  );
}
