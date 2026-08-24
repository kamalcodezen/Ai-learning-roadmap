"use client";

import React, { useState } from "react";
import Header, { type BillingPeriod } from "./Header";
import { pricingPlans, type PricingPlan } from "./plans";
import { NumberTicker } from "@/src/registry/magicui/number-ticker";
import Button from "../../ui/button";

const Pricing = () => {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  const getCurrentPrice = (plan: PricingPlan) =>
    billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  const handlePlanCta = (index: number) => {
    alert(`Price: $${getCurrentPrice(pricingPlans[index])}`);
  };

  return (
    <section className="section-pad lg:px-10  relative w-full overflow-hidden px-4 sm:px-8 md:px-12">
      <div className=" global-pos relative w-full">
        {/* Header */}
        <Header billing={billing} onBillingChange={setBilling} />

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 items-stretch gap-7 lg:grid-cols-3 mx-auto max-w-7xl">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-6 shadow-[var(--shadow)] transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? "z-10 mb-7 border-2 border-primary bg-[linear-gradient(to_bottom,#f3e8ff_0%,#ede5ff_45%,#ddd0ff_100%)] bg-card dark:bg-none lg:-mt-8 lg:py-8"
                  : "border border-border bg-card"
              }`}
            >
              {/* Most Popular */}
              {plan.popular && (
                <div className="section-badge absolute right-4 top-4">
                  ★ Most Popular
                </div>
              )}

              {/* Plan Name */}
              <h3 className="pt-1 text-center text-base font-semibold text-foreground">
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
              <div className="my-5 h-px bg-border " />

              {/* Button */}
              <div className="flex justify-center">
                <Button
                text={plan.cta}
                variant={plan.popular ? "primary" : "soft"}
                onClick={() => handlePlanCta(index)}
                className="w-fit "
              />
              </div>

              {/* Description */}
              <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                {plan.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;