"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header, { type BillingPeriod } from "./Header";
import { pricingPlans, type PricingPlan } from "./plans";
import { NumberTicker } from "@/src/registry/magicui/number-ticker";
import Button from "../../ui/button";
import { authClient } from "@/src/lib/auth-client";

const Pricing = () => {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const { data: session } = authClient.useSession();

  const user = session?.user as { plan?: string; role?: string } | undefined;
  const userPlan = user?.plan?.toUpperCase() || "FREE";
  const isLoggedIn = !!user;

  const getCurrentPrice = (plan: PricingPlan) =>
    billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  const getPlanStatus = (plan: PricingPlan) => {
    if (!isLoggedIn) {
      return { isCurrent: false, isIncluded: false, buttonText: plan.cta, disabled: false };
    }

    if (plan.slug === "go-ai-pather") {
      if (userPlan === "FREE") {
        return { isCurrent: true, isIncluded: false, buttonText: "Current Plan", disabled: true };
      }
      return { isCurrent: false, isIncluded: true, buttonText: "Included in Plan", disabled: true };
    }

    if (plan.slug === "plus-ai-pather") {
      if (userPlan === "PLUS") {
        return { isCurrent: true, isIncluded: false, buttonText: "Current Plan", disabled: true };
      }
      if (userPlan === "PRO") {
        return { isCurrent: false, isIncluded: true, buttonText: "Included in Pro", disabled: true };
      }
      return { isCurrent: false, isIncluded: false, buttonText: plan.cta, disabled: false };
    }

    if (plan.slug === "pro-ai-pather") {
      if (userPlan === "PRO") {
        return { isCurrent: true, isIncluded: false, buttonText: "Current Plan", disabled: true };
      }
      return {
        isCurrent: false,
        isIncluded: false,
        buttonText: userPlan === "PLUS" ? "Upgrade to Pro" : plan.cta,
        disabled: false,
      };
    }

    return { isCurrent: false, isIncluded: false, buttonText: plan.cta, disabled: false };
  };

  const handlePlanClick = (plan: PricingPlan) => {
    const status = getPlanStatus(plan);
    if (status.disabled) return;

    if (!session?.user) {
      router.push("/signin");
      return;
    }

    // Free plan (Go): send directly to dashboard
    if (plan.monthlyPrice === 0 || plan.slug === "go-ai-pather") {
      const userRole = (user?.role || "LEARNER").toUpperCase();
      router.push(userRole === "ADMIN" ? "/dashboard/admin" : "/dashboard/learner");
      return;
    }

    router.push(`/checkout/${plan.slug}?billing=${billing}`);
  };

  return (
    <section id="pricing" className="section-pad lg:px-10 relative w-full overflow-hidden px-4 sm:px-8 md:px-12">
      <div className="global-pos relative w-full">
        {/* Header */}
        <Header billing={billing} onBillingChange={setBilling} />

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 items-stretch gap-0 min-[55rem]:grid-cols-3 mx-auto max-w-6xl">
          {pricingPlans.map((plan) => {
            return (
              <div
                key={plan.name}
                style={{
                  "--gh-angle": "-45deg",
                  "--gh-duration": "600ms",
                  "--gh-size": "250%",
                  "--gh-rgba": "rgba(159,84,247,0.35)",
                } as React.CSSProperties}
                className={`relative rounded-3xl p-6 shadow-[var(--shadow)] transition-all duration-300 hover:-translate-y-1 overflow-clip before:pointer-events-none before:absolute before:inset-0 before:z-10 before:bg-no-repeat before:content-[''] before:[background-image:linear-gradient(var(--gh-angle),transparent_60%,var(--gh-rgba)_70%,transparent,transparent_100%)] before:[background-size:var(--gh-size)_var(--gh-size),100%_100%] before:[background-position:-100%_-100%,0_0] before:transition-none hover:before:transition-[background-position] hover:before:duration-[var(--gh-duration)] hover:before:ease-in-out hover:before:[background-position:100%_100%,0_0] ${
                  plan.popular
                    ? "z-10 border-2 border-primary bg-[linear-gradient(to_bottom,#f3e8ff_0%,#ede5ff_45%,#ddd0ff_100%)] dark:bg-[linear-gradient(to_bottom,rgba(243,232,255,0.15)_0%,rgba(237,229,255,0.10)_45%,rgba(221,208,255,0.07)_100%)] lg:-mt-8 h-fit lg:py-8"
                    : "border border-border bg-card dark:bg-[linear-gradient(to_bottom,rgba(243,232,255,0.08)_0%,rgba(237,229,255,0.05)_45%,rgba(221,208,255,0.03)_100%)]"
                }`}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="section-badge absolute right-0 top-0">
                    ★ Most Popular
                  </div>
                )}

                {/* Plan Name */}
                <h3 className="pt-1 text-3xl text-center  font-semibold text-foreground">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mt-8 flex items-end justify-center gap-2">
                  <span className="text-5xl font-bold leading-none text-foreground dark:text-primary">
                    $
                    <NumberTicker
                      value={getCurrentPrice(plan)}
                      startValue={plan.monthlyPrice}
                    />
                  </span>

                  <span className="pb-1 text-sm font-semibold text-muted-foreground">
                    / {billing === "yearly" ? "year" : "month"}
                  </span>
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  {billing === "yearly" ? "billed annually" : "billed monthly"}
                </p>

                {/* Features */}
                <ul className="mt-7 space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="mt-0.5 font-semibold text-primary">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Divider */}
                <div className="my-5 h-px bg-border" />

                {/* Action */}
                <div className="flex justify-center">
                  {(() => {
                    const status = getPlanStatus(plan);
                    return (
                      <Button
                        text={status.buttonText}
                        variant={status.disabled ? "soft" : plan.popular ? "primary" : "soft"}
                        disabled={status.disabled}
                        className={`w-fit ${status.disabled ? "!opacity-75 !cursor-not-allowed" : ""}`}
                        onClick={() => handlePlanClick(plan)}
                      />
                    );
                  })()}
                </div>

                {/* Description */}
                <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                  {plan.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;