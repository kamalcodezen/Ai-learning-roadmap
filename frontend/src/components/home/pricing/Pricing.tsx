"use client";

import React, { useState } from "react";
import Header, { type BillingPeriod } from "./Header";
import { NumberTicker } from "@/src/registry/magicui/number-ticker";
import Button from "../../ui/button";

type PricingPlan = {
  name: string;
  price: number;
  features: string[];
  description: string;
  popular?: boolean;
};


const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: 0,
    features: [
      "Basic Crop Monitoring",
      "1 Hectare Coverage",
      "Email Support",
    ],
    description: "Perfect for small farms just starting out.",
  },
  {
    name: "Professional Plan",
    price: 399,
    features: [
      "Up to 50 Hectares",
      "Advanced Crop Monitoring",
      "Disease Detection",
      "Priority 24/7 Support",
    ],
    description: "Ideal for scaling farms and commercial operations.",
    popular: true,
  },
  {
    name: "Enterprise Plan",
    price: 799,
    features: [
      "Unlimited Coverage",
      "All Services Included",
      "Smart Irrigation Control",
      "Dedicated Account Manager",
    ],
    description: "Complete solution for large-scale operations.",
  },
];

const Pricing = () => {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  const getCurrentPrice = (price: number) =>
    billing === "yearly" ? Math.round(price * 0.8) : price;

  const handleFreeGetStarted = () => {
    alert(`Price: $${getCurrentPrice(pricingPlans[0].price)}`);
  };

  const handleProfessionalGetStarted = () => {
    alert(`Price: $${getCurrentPrice(pricingPlans[1].price)}`);
  };

  const handleEnterpriseGetStarted = () => {
    alert(`Price: $${getCurrentPrice(pricingPlans[2].price)}`);
  };

  const getStartedHandlers: Record<string, () => void> = {
    Free: handleFreeGetStarted,
    "Professional Plan": handleProfessionalGetStarted,
    "Enterprise Plan": handleEnterpriseGetStarted,
  };

  return (
    <section className="bg-muted/40  dark:bg-transparent  lg:px-10  relative w-full overflow-hidden py-12 pt-0 px-4 sm:px-8 md:px-12">
      <div className=" global-pos relative w-full">
        {/* Header */}
        <Header billing={billing} onBillingChange={setBilling} />

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 items-stretch gap-7 lg:grid-cols-3 mx-auto max-w-7xl">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-6 shadow-[var(--shadow)] transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? "z-10 mb-7 border-2 border-primary bg-[linear-gradient(to_bottom,#f4ffd6_0%,#eaffbd_45%,#dff5a5_100%)] bg-card dark:bg-none lg:-mt-8 lg:py-8"
                  : "border border-border bg-card"
              }`}
            >
              {/* Most Popular */}
              {plan.popular && (
                <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-primary px-4 py-2 text-sm font-semibold text-secondary shadow-[0_0_20px_rgba(206,255,31,0.3)] dark:shadow-[0_0_25px_rgba(206,255,31,0.4)]">
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
                  <NumberTicker value={getCurrentPrice(plan.price)} />
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
                text="Get Started"
                variant={plan.popular ? "primary" : "soft"}
                onClick={getStartedHandlers[plan.name]}
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