import type { Metadata } from "next";
import Pricing from "@/src/components/home/pricing/Pricing";

export const metadata: Metadata = {
  title: "Pricing & Plans — AI Pather",
  description:
    "Explore AI Pather subscription tiers and choose the plan that best accelerates your career growth.",
};

const PricingPage = () => {
  return (
    <div className="min-h-screen transition-transform duration-700 pt-16">
      <Pricing />
    </div>
  );
};

export default PricingPage;
