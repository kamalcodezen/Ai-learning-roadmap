"use client";

import  { useRef } from "react";
import confetti from "canvas-confetti";

export type BillingPeriod = "monthly" | "yearly";

interface HeaderProps {
  billing: BillingPeriod;
  onBillingChange: (billing: BillingPeriod) => void;
}

const Header = ({ billing, onBillingChange }: HeaderProps) => {
  const toggleRef = useRef<HTMLButtonElement>(null);

  const fireConfetti = () => {
    const rect = toggleRef.current?.getBoundingClientRect();
    confetti({
      particleCount: 80,
      spread: 75,
      startVelocity: 45,
      scalar: 0.9,
      ticks: 200,
      origin: rect
        ? {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          }
        : { x: 0.5, y: 0.5 },
      colors: ["#CEFF1F", "#131824", "#ffffff"],
    });
  };

  const handleToggle = () => {
    fireConfetti();
    onBillingChange(billing === "monthly" ? "yearly" : "monthly");
  };
  return (
    <div className="text-left">
      <h2 className="font-poppins text-h2 font-bold tracking-tight text-foreground text-balance md:text-5xl">
       Simple Plans, <span className="text-brand">Maximum Learning</span>
      </h2>

      <p className="mt-4 text-base text-muted-foreground md:text-lg">
        Start for free with full diagnostics, or upgrade to unlock unlimited skill proofing and real-time job readiness analysis.
      </p>

      {/* Billing Toggle */}
      <div className="mt-12 flex items-center justify-center gap-4">
        <span
          className={`text-base font-medium transition-colors ${
            billing === "monthly"
              ? "text-foreground"
              : "text-muted-foreground"
          }`}
        >
          Monthly
        </span>

        <button
          ref={toggleRef}
          type="button"
          role="switch"
          aria-checked={billing === "yearly"}
          aria-label="Toggle billing period"
          onClick={handleToggle}
          className="relative h-8 w-14 rounded-full bg-secondary shadow-[var(--shadow)] dark:shadow-[0_0_15px_rgba(206,255,31,0.2)]"
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-primary transition-all ${
              billing === "yearly" ? "left-7" : "left-1"
            }`}
          />
        </button>

        <span
          className={`text-base font-medium transition-colors ${
            billing === "yearly" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Yearly
        </span>

        <span className="text-sm font-semibold text-primary">
          (Save 20%)
        </span>
      </div>
    </div>
  );
};

export default Header;