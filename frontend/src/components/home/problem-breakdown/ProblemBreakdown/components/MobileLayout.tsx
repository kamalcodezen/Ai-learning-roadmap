import EvolvingSystemVisual from "../../EvolvingSystemVisual";
import { NarrativeState } from "../data/narrativeStates";

interface MobileLayoutProps {
  states: NarrativeState[];
}

export default function MobileLayout({ states }: MobileLayoutProps) {
  return (
    <div className="mt-12 flex flex-col gap-10 lg:hidden w-full overflow-hidden">
      {states.map((state, idx) => (
        <div key={state.id} className="flex flex-col gap-3.5">
          <div className="relative h-[320px] overflow-hidden rounded-3xl border-2 border-border bg-card shadow-lg">
            <EvolvingSystemVisual activeState={idx} />
          </div>

          <div className="space-y-1 px-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                {state.eyebrow}
              </span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {state.tag}
              </span>
            </div>

            <h3 className="font-poppins text-lg font-bold leading-snug text-foreground">
              {state.title}
            </h3>

            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              {state.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
