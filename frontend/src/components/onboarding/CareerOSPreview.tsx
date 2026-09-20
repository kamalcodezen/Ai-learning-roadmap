import { BrainCircuit, CheckCircle2, ShieldCheck, Target, Zap } from "lucide-react";
import Image from "next/image";
import { Card } from "@/src/components/ui/Card";
import brandLogo from "@/public/brand/logo-p-dark.png";

interface CareerOSPreviewProps {
  currentRole: string;
  currentExperience: string;
  canContinue: boolean;
}

function getInitials(role: string) {
  if (!role || role === "Not selected") return "?";
  return role
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function CareerOSPreview({
  currentRole,
  currentExperience,
  canContinue,
}: CareerOSPreviewProps) {
  const initials = getInitials(currentRole);

  return (
    <Card
      mouseGlow
      className="group relative overflow-hidden rounded-md border-2 border-background shadow-none"
    >
      <div className="relative z-10">
        <div className="border-b border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                Ready to start
              </p>
              <h3 className="mt-1 text-base font-semibold text-foreground">
                Your AI Pather
              </h3>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
              <span
                className={`h-2 w-2 rounded-full ${canContinue ? "animate-pulse bg-primary" : "bg-muted-foreground"}`}
              />
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="rounded-2xl border border-border p-4 soft-card bg-card-soft">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Career Twin
              </span>
              <span className="text-[10px] font-semibold uppercase text-primary">
                {canContinue ? "Ready" : "Waiting"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/[0.08] text-lg font-bold text-primary">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {currentRole}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {currentExperience} level
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            <div className="rounded-2xl border border-border bg-card-soft p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Target Role</span>
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="mt-2 truncate text-sm font-semibold text-foreground">
                {currentRole}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card-soft p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Experience</span>
                <BrainCircuit className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {currentExperience}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card-soft p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Initialization</span>
                <span className="text-xs font-semibold text-primary">
                  {canContinue ? "Complete" : "In progress"}
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full bg-primary transition-all duration-500 ${canContinue ? "w-full shadow-[0_0_12px_rgba(159,84,247,0.45)]" : "w-2/3"}`}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/[0.035] p-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Image
                  src={brandLogo}
                  alt="AI Pather"
                  height={20}
                  width={20}
                  className="ml-1 h-4 w-4 brightness-0 dark:invert"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground">Next step</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  A short adaptive diagnostic maps your fundamentals and shapes
                  your personalized roadmap.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="ml-1 truncate">
              You can refine your career direction anytime from the dashboard.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}