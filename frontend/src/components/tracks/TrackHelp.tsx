import { Stethoscope, Map, Hammer, Briefcase } from "lucide-react";
import type { Track } from "@/src/data/tracks";

const stepIcons = [Stethoscope, Map, Hammer, Briefcase];

const stepLabels = [
  "Diagnose",
  "Learn & Build",
  "Prove It",
  "Get Hired",
];

export default function TrackHelp({ track }: { track: Track }) {
  return (
    <section className="section-pad relative w-full overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-[100%] bg-primary/10 blur-[150px] pointer-events-none -z-10" />

      <div className="global-pos">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3.5 py-1 font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            The AI Pather Method
          </span>
          <h2 className="section-title mt-4">
            How AI Pather Builds{" "}
            <span className="text-primary">{track.title}s</span>
          </h2>
          <p className="section-subtitle mt-1">
            A complete, AI-guided system — not another course library — that
            takes you from wherever you are now to an interview-ready{" "}
            {track.title}
          </p>
        </div>

        {/* Step cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {track.helpSteps.map((step, i) => {
            const Icon = stepIcons[i % stepIcons.length];
            return (
              <div key={step.title} className="dashboard-card p-6 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Step {i + 1} · {stepLabels[i]}
                  </span>
                </div>
                <h3 className="mt-4 font-poppins text-base font-bold text-foreground leading-snug">
                  {step.title}
                </h3>
                <p className="mt-2 font-poppins text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            Skill-Gap Diagnosed
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            Milestone Projects
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-blue-500" />
            AI Mock Interviews
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-purple-500" />
            Verified Proof
          </span>
        </div>
      </div>
    </section>
  );
}