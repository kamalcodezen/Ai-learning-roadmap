export type PricingPlan = {
  slug: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceId?: string;
  yearlyPriceId?: string;
  cta: string;
  features: string[];
  description: string;
  popular?: boolean;
};

// yearlyPrice = monthlyPrice * 12 * 0.8 → keeps the header's "Save 20%" honest
export const pricingPlans: PricingPlan[] = [
  {
    slug: "starter",
    name: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Get Started",
    features: [
      "Career Readiness Twin Diagnostics",
      "Standard Career Roadmap Generator",
      "Basic Skill-Gap Analysis",
      "Community Forum Support",
    ],
    description: "Find your baseline. Start free.",
  },
  {
    slug: "pro-career-os",
    name: "Pro Career OS",
    monthlyPrice: 29,
    yearlyPrice: 199,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || "",
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || "",
    cta: "Get Started",
    features: [
      "Unlimited Skill Proof Graphing",
      "Automated Learning Debt Resolution",
      "Job Reality Check & JD Scanning",
      "AI Copilot Memory & Guidance",
      "Zero-Guilt Adaptive Recovery",
    ],
    description: "Everything you need to become job-ready.",
    popular: true,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    monthlyPrice: 99,
    yearlyPrice: 699,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "",
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "",
    cta: "Contact Sales",
    features: [
      "Unlimited Organization Members",
      "All Pro Features Included",
      "Recruiter Candidate Verification Portal",
      "Custom Career Roadmap Templates",
      "Dedicated Account Manager",
    ],
    description: "For bootcamps and university cohorts.",
  },
];