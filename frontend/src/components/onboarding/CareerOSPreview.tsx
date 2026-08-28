import { BrainCircuit, ShieldCheck, Sparkles, Target, Zap } from "lucide-react";

import { Card } from "@/src/components/ui/Card";
import type { ExperienceLevel } from "./ExperienceSection";

interface CareerOSPreviewProps {
  currentRole: string;
  currentExperience: string;
  canContinue: boolean;
  selectedTrack: string;
  customGoal: string;
  experience: ExperienceLevel | "";
}

export function CareerOSPreview({
  currentRole,
  currentExperience,
  canContinue,
  selectedTrack,
  customGoal,
  experience,
}: CareerOSPreviewProps) {
  return (
    <aside className="xl:sticky xl:top-8 xl:self-start">
      <Card
        mouseGlow
        className="group relative overflow-hidden rounded-md transition-all duration-300 border-2 border-background hover:border-brand shadow-none bg-[linear-gradient(to_bottom,#faf5ff_0%,#f3edff_45%,#ede5ff_100%)] dark:bg-[linear-gradient(to_bottom,#1a0e2e_0%,rgba(159,84,247,0.15)_100%)]"
      >
        <div className="relative z-10">
        <div className="border-b border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Live Preview
              </p>
              <h3 className="mt-1 text-base font-semibold">
                Your Ai Pather
              </h3>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="rounded-2xl border border-border bg-card-soft p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Career Twin
              </span>
              <span className="text-[10px] text-primary">
                INITIALIZING
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="
                  relative
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-primary/20
                  bg-primary/[0.06]
                "
              >
                <div className="text-lg font-bold">—</div>
              </div>

              <div>
                <p className="text-sm font-semibold">{currentRole}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {currentExperience} level
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            <div className="rounded-2xl border border-border bg-card-soft p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Target Role
                </span>
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="mt-2 truncate text-sm font-semibold">
                {currentRole}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card-soft p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Experience
                </span>
                <BrainCircuit className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="mt-2 text-sm font-semibold">
                {currentExperience}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card-soft p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Initialization
                </span>
                <span className="text-xs font-semibold text-primary">
                  {canContinue ? "Ready" : "Waiting"}
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`
                    h-full
                    rounded-full
                    bg-primary
                    transition-all
                    duration-500
                    ${
                      canContinue
                        ? "w-full shadow-[0_0_12px_rgba(206,255,31,0.45)]"
                        : selectedTrack || customGoal
                          ? "w-2/3"
                          : experience
                            ? "w-1/2"
                            : "w-1/4"
                    }
                  `}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/[0.035] p-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>

              <div>
                <p className="text-xs font-semibold">Ai Pather</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Your choices will shape the diagnostic, learning debt
                  detection, and adaptive roadmap.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border bg-card-soft p-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
                Personalized
                <br />
                Career Intelligence
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card-soft p-3">
              <Zap className="h-4 w-4 text-primary" />
              <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
                Adaptive
                <br />
                Learning Engine
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
    </aside>
  );
}
