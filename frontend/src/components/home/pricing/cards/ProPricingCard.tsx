"use client";

import PricingFeature from "../PricingFeature";
import Button from "../../../ui/button";


interface PricingCardProps {
  badge: string;
  price: string;
  priceSuffix?: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
   className?: string;
}

const PricingCard = ({
  badge,
  price,
  priceSuffix,
  description,
  features,
  buttonText,
  popular = false,
   className = "",
}: PricingCardProps) => {

  // Button click handler
  const handleButtonClick = () => {
    if (popular) {
      alert("Pro Plan selected!");
    } else {
      alert("Free Plan selected!");
    }
  };

 return (
  <article
    className={`dashboard-card relative h-full overflow-visible rounded-3xl border
      bg-[linear-gradient(to_bottom,#f4ffd6_0%,#eaffbd_45%,#dff5a5_100%)]
      dark:bg-[linear-gradient(to_bottom,#0f2a02_0%,#1a3a05_28%,#304c0a_55%,#6b861c_100%)]
      ${className}
      ${
        popular
          ? "border-primary/50 shadow-[0_12px_40px_rgba(206,255,31,0.10)]"
          : "border-zinc-300 shadow-none dark:border-zinc-700"
      }`}
  >
    {/* Most Popular Badge */}
    {popular && (
      <div className="absolute -top-7 left-7 z-10 rounded-t-lg bg-primary px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#131824]">
        Most Popular
      </div>
    )}

    {/* Card Container */}
  {/* Card Container */}
<div className="flex h-fit min-h-[285px] flex-col ">

  {/* Left - Pricing Information */}
  <div className="flex w-full flex-col p-2 sm:p-3 lg:px-5">

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
      <Button
        text={buttonText}
        onClick={handleButtonClick}
        className="w-fit"
      />
    </div>
  </div>

  {/* Right - Features */}
  <div className="flex w-full flex-1 p-2 sm:p-3 lg:px-5 text-zinc-800 dark:text-white/75">
    <div className="flex w-full flex-col justify-center gap-4">
      {features.map((feature) => (
        <PricingFeature
          key={feature}
          text={feature}
        />
      ))}
    </div>
  </div>

</div>
  </article>
);
};

export default PricingCard;