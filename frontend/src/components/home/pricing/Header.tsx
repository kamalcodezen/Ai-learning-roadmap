"use client";

import  { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export type BillingPeriod = "monthly" | "yearly";

interface HeaderProps {
  billing: BillingPeriod;
  onBillingChange: (billing: BillingPeriod) => void;
}

const CONFETTI_COLORS = ["#9F54F7", "#B978FF", "#ffffff"];

const Header = ({ billing, onBillingChange }: HeaderProps) => {
  const toggleRef = useRef<HTMLDivElement>(null);
  const echoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Don't let a pending echo burst fire after unmount/navigation
  useEffect(
    () => () => {
      if (echoTimeoutRef.current) clearTimeout(echoTimeoutRef.current);
    },
    [],
  );

  const getOrigin = () => {
    const rect = toggleRef.current?.getBoundingClientRect();
    return rect
      ? {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        }
      : { x: 0.5, y: 0.5 };
  };

  const fireConfetti = () => {
    const origin = getOrigin();

    // Wave 1 — tight, punchy burst from the toggle
    confetti({
      particleCount: 140,
      spread: 90,
      startVelocity: 45,
      scalar: 0.9,
      ticks: 200,
      origin,
      colors: CONFETTI_COLORS,
    });

    // Wave 2 — wider, softer echo ~80ms later for layered fullness
    echoTimeoutRef.current = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 120,
        startVelocity: 35,
        scalar: 0.8,
        ticks: 250,
        origin,
        colors: CONFETTI_COLORS,
      });
    }, 80);
  };

  const handleSelect = (period: BillingPeriod) => {
    if (period === billing) return;

    // Celebrate only the upgrade moment (switching to yearly)
    if (period === "yearly") {
      fireConfetti();
    }

    onBillingChange(period);
  };

  const periodPill = (active: boolean) =>
    `rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
      active
        ? "bg-primary text-white shadow-[0_0_18px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="text-center">
      <h2 className="font-poppins text-3xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-4xl">
        Simple Plans, <span className="text-brand">Maximum Learning</span>
      </h2>

      <p className="mx-auto section-description mt-4 max-w-xl font-poppins text-lg text-muted-foreground">
        Start for free with full diagnostics, or upgrade to unlock unlimited skill proofing and real-time job readiness analysis.
      </p>

      {/* Billing Toggle — button pair, selected side highlighted */}
      <div className="mt-5 flex justify-center">
        <div
          ref={toggleRef}
          role="group"
          aria-label="Toggle billing period"
          className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-[var(--shadow)]"
        >
          <button
            type="button"
            aria-pressed={billing === "monthly"}
            onClick={() => handleSelect("monthly")}
            className={periodPill(billing === "monthly")}
          >
            Monthly
          </button>

          <button
            type="button"
            aria-pressed={billing === "yearly"}
            onClick={() => handleSelect("yearly")}
            className={`${periodPill(billing === "yearly")} flex items-center gap-1.5`}
          >
            Yearly
            <span className="text-xs font-extrabold opacity-90">(Save 20%)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;