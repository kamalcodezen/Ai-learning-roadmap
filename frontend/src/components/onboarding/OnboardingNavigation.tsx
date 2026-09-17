"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

interface OnboardingNavigationProps {
  step: number;
  totalSteps: number;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
  isSaving?: boolean;
}

export function OnboardingNavigation({
  step,
  totalSteps,
  canContinue,
  onBack,
  onContinue,
  isSaving = false,
}: OnboardingNavigationProps) {
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      {!isFirst ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="btn-secondary inline-flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-foreground transition hover:border-primary/40"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      ) : (
        <span aria-hidden="true" />
      )}

      {!isLast && (
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue || isSaving}
          className="btn-primary inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}