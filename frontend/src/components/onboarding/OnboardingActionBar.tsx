import { ShieldCheck } from "lucide-react";

import { Card } from "@/src/components/ui/Card";
import { BorderBeam } from "@/src/components/ui/border-beam";

import "./onboardingActionButton.css";

interface OnboardingActionBarProps {
  canContinue: boolean;
  handleContinue: () => void;
}

export function OnboardingActionBar({ canContinue, handleContinue }: OnboardingActionBarProps) {
  return (
    <div className="mt-6">
      <Card
        mouseGlow
        className="group relative overflow-hidden rounded-md border-2 border-background shadow-none bg-[linear-gradient(to_bottom,#faf5ff_0%,#f3edff_45%,#ede5ff_100%)] dark:bg-[linear-gradient(to_bottom,#1a0e2e_0%,rgba(159,84,247,0.15)_100%)]"
      >
        <BorderBeam
          duration={6}
          size={200}
          borderWidth={2}
          className="from-transparent via-[#9F54F7] to-transparent"
        />
        <BorderBeam
          duration={6}
          delay={3}
          size={200}
          borderWidth={2}
          className="from-transparent via-[#c084fc] to-transparent"
        />
        <div
          className="
            relative
            z-10
            flex
            flex-col
            gap-4
            p-4
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-5
          "
        >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>

          <div>
            <p className="text-xs font-medium">Your profile stays yours.</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              You can refine your career direction later.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={!canContinue}
          onClick={handleContinue}
          className="diagnostic-btn h-12 rounded-xl px-6 text-sm"
        >
          <span>Continue to Diagnostic</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 66 43"
            aria-hidden="true"
          >
            <polygon points="39.58,4.46 44.11,0 66,21.5 44.11,43 39.58,38.54 56.94,21.5" />
            <polygon points="19.79,4.46 24.32,0 46.21,21.5 24.32,43 19.79,38.54 37.15,21.5" />
            <polygon points="0,4.46 4.53,0 26.42,21.5 4.53,43 0,38.54 17.36,21.5" />
          </svg>
        </button>
      </div>
      </Card>
    </div>
  );
}
