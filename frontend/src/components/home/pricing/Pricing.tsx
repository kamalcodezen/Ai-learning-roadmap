"use client";

import React, { useRef, useState } from "react";
import PricingCard from "./cards/ProPricingCard";
import SimplePricingCard from "./cards/SimplePricingCard";
import EnterprisePricingCard from "./cards/EnterprisePricingCard";
import { Confetti, type ConfettiRef } from "@/src/registry/magicui/confetti";

const freeFeatures: string[] = [
  "One-user access",
  "Personalized Learning Roadmap",
  "AI Skill Gap Analysis",
  "Project-based Milestones",
  "Learning Resource Collection",
];

const proFeatures: string[] = [
  "Everything in Free",
  "Advanced Skill Gap Analysis",
  "Adaptive Learning Roadmap",
  "Career Trajectory Insights",
  "Priority AI Features",
];

const enterpriseFeatures: string[] = [
  "Everything in Pro",
  "Unlimited Team Access",
  "Custom AI Model Integration",
  "Dedicated Success Manager",
  "Enterprise Analytics & SLA",
];

/* Shared description block - rendered once per breakpoint */
const DescriptionText = ({
  className = "",
  isYearly,
  onBillingChange,
}: {
  className?: string;
  isYearly: boolean;
  onBillingChange: (yearly: boolean) => void;
}) => (
  <div className={`relative h-fit ${className}`}>
    

    <p className="text-sm leading-6 text-muted-foreground sm:text-base pr-20">
      One simple plan for getting started, with advanced options for
      learners and teams who want deeper AI-powered guidance.
    </p>

    {/* <div className="mt-5 flex items-center gap-3">
      <span className="text-sm font-medium text-foreground">
        Start for free
      </span>
      <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
      <span className="text-sm text-muted-foreground">
        Upgrade anytime
      </span>
    </div> */}

    {/* Monthly / Yearly Billing Toggle */}
    <div className="mt-5 inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onBillingChange(false)}
        aria-pressed={!isYearly}
        className={`rounded-full px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 ${
          !isYearly
            ? "bg-primary text-[#131824] shadow-[0_0_12px_-2px_rgba(206,255,31,0.5)]"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onBillingChange(true)}
        aria-pressed={isYearly}
        className={`rounded-full px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 ${
          isYearly
            ? "bg-primary text-[#131824] shadow-[0_0_12px_-2px_rgba(206,255,31,0.5)]"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Yearly
      </button>
    </div>
  </div>
);

const Pricing: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);
  const confettiRef = useRef<ConfettiRef>(null);

  const handleBillingChange = (yearly: boolean) => {
    setIsYearly(yearly);
    if (yearly) {
      void confettiRef.current?.fire({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#CEFF1F", "#ffffff", "#131824"],
      });
    }
  };

  return (
    <section
      id="pricing"
      className="relative w-full overflow-hidden py-10 px-4 sm:px-8 md:px-12"
    >
      {/* Yearly-plan celebration overlay */}
      <Confetti
        ref={confettiRef}
        manualstart
        className="pointer-events-none absolute inset-0 z-50 size-full"
      />

      <div className="global-pos relative w-full">
        {/* Main 3-Column Layout */}
        <div className="mt-10 grid grid-cols-1 items-end gap-5 lg:grid-cols-3 2xl:items-stretch">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="flex flex-col gap-5">
            {/* Text Body - Height Fit */}
            <div className="h-fit">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.08]">
                <span className="inline">  
                Simple pricing for your
                </span>
                {/* <br className="hidden sm:block" /> */}
                <span className="text-primary"> learning journey</span>
              </h2>

              <p className="section-description mt-4 text-sm sm:text-base">
                Start building your personalized AI learning roadmap for free and
                unlock advanced features when you are ready.
              </p>
            </div>

            {/* Description Text - Mobile & Tablet only (placed after 1st text body) */}
            <DescriptionText
              className="lg:hidden"
              isYearly={isYearly}
              onBillingChange={handleBillingChange}
            />

            {/* Free Card - Simple Clean Design */}
            <div className="2xl:flex-1">
              <SimplePricingCard
                badge="FREE"
                price="Free"
                description="Perfect for getting started with your personalized learning journey."
                features={freeFeatures}
                buttonText="Continue"
              />
            </div>
          </div>

          {/* ================= MIDDLE COLUMN (PRO PLAN - PREMIUM GLOW) ================= */}
          <div className="flex">
            <PricingCard
              badge="PRO"
              price={isYearly ? "$149" : "$19"}
              priceSuffix={isYearly ? "/year" : "/month"}
              description="For learners who want deeper AI guidance and advanced career insights."
              features={proFeatures}
              buttonText="Buy Now"
              popular
              className="w-full 2xl:min-h-[500px]"
            />
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="flex flex-col gap-5">
            {/* Description Container - Desktop only */}
            <DescriptionText
              className="hidden lg:block"
              isYearly={isYearly}
              onBillingChange={handleBillingChange}
            />

            {/* Enterprise Card - Dedicated Glowing Neon Component */}
            <div className="2xl:flex-1">
              <EnterprisePricingCard
                badge="ENTERPRISE"
                price="Custom"
                description="Perfect for teams and organizations needing full custom roadmaps."
                features={enterpriseFeatures}
                buttonText="Contact"
              />
            </div>
          </div>

        </div>

        {/* Bottom Note */}
        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-muted-foreground sm:text-sm">
          We keep our pricing simple and transparent. Choose the plan that fits
          your learning journey and upgrade whenever you need more advanced
          features.
        </p>
      </div>
    </section>
  );
};

export default Pricing;