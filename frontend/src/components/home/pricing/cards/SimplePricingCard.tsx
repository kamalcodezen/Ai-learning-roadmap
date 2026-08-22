"use client";

import Button from "../../../ui/button";
import PricingFeature from "../PricingFeature";

export interface SimplePricingCardProps {
  badge?: string;
  price: string;
  priceSuffix?: string;
  description: string;
  features?: string[];
  buttonText?: string;
  className?: string;
}

const SimplePricingCard = ({
  badge,
  price,
  priceSuffix,
  description,
  features = [],
  buttonText = "Get Started",
  className = "",
}: SimplePricingCardProps) => {
  return (
    <article
      className={`relative h-full overflow-visible rounded-3xl border border-zinc-300 shadow-none
        bg-background dark:bg-card
        dark:border-zinc-700
        ${className}`}
    >
      {/* Card Container */}
      <div className="flex h-fit min-h-[285px] flex-col 2xl:flex-row">
        {/* Left - Pricing Information */}
        <div className="flex w-full flex-col p-2 sm:p-3 lg:px-5 2xl:w-[49%]">
          {/* Plan Badge */}
          <div className="mb-5">
            <span className="inline-flex rounded-md border border-zinc-900/20 bg-zinc-900/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black dark:border-white/20 dark:bg-white/10 dark:text-white">
              {badge}
            </span>
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-end gap-1">
            <span className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-5xl">
              {price}
            </span>

            {priceSuffix && (
              <span className="mb-1 text-sm font-medium text-zinc-700 dark:text-white/70">
                {priceSuffix}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-3 text-sm font-normal leading-6 text-zinc-800 dark:text-white/75">
            {description}
          </p>

          {/* Button */}
          <div className="mt-auto pt-6">
            <Button text={buttonText} className="w-fit" />
          </div>
        </div>

        {/* Right - Features */}
        <div className="flex w-full flex-1 p-2 sm:p-3 lg:px-5 text-zinc-800 dark:text-white/75">
          <div className="flex w-full flex-col justify-center gap-4">
            {features.map((feature) => (
              <PricingFeature key={feature} text={feature} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};

export default SimplePricingCard;
