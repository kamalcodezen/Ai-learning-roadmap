export type PricingPlan = {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  cta: string;
  features: string[];
  description: string;
  popular?: boolean;
};

// yearlyPrice = monthlyPrice * 12 * 0.8 → keeps the header's "Save 20%" honest
export const pricingPlans: PricingPlan[] = [
  {
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
    name: "Pro Career OS",
    monthlyPrice: 29,
    yearlyPrice: 199,
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
    name: "Enterprise",
    monthlyPrice: 99,
    yearlyPrice: 699,
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
