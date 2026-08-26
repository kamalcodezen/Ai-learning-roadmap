import { ArrowRight, ShieldCheck } from "lucide-react";

interface OnboardingActionBarProps {
  canContinue: boolean;
  handleContinue: () => void;
}

export function OnboardingActionBar({ canContinue, handleContinue }: OnboardingActionBarProps) {
  return (
    <div className="mt-6">
      <div
        className="
          flex
          flex-col
          gap-4
          rounded-2xl
          border
          border-border
          bg-card/70
          p-4
          backdrop-blur-xl
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
          className="
            group
            inline-flex
            h-12
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-primary
            px-6
            text-sm
            font-bold
            text-secondary
            shadow-[0_0_30px_rgba(206,255,31,0.12)]
            transition-all
            duration-300
            hover:shadow-[0_0_40px_rgba(206,255,31,0.2)]
            disabled:cursor-not-allowed
            disabled:opacity-30
            disabled:shadow-none
          "
        >
          Continue to Diagnostic
          <ArrowRight
            className="
              h-4
              w-4
              transition-transform
              group-hover:translate-x-1
            "
          />
        </button>
      </div>
    </div>
  );
}
