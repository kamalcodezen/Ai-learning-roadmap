import type { Metadata } from "next";
import Pricing from "@/src/components/home/pricing/Pricing";

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description:
    "Choose the right AI Pather plan for your tech journey. Unlock full personalized roadmaps, unlimited AI diagnostic assessments, realistic mock interviews, and verified skill proofs.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing & Plans | AI Pather",
    description:
      "Choose the right AI Pather plan for your tech journey. Unlock full personalized roadmaps, unlimited AI diagnostic assessments, realistic mock interviews, and verified skill proofs.",
    url: "/pricing",
    siteName: "AI Pather",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing & Plans | AI Pather",
    description:
      "Choose the right AI Pather plan for your tech journey. Unlock full personalized roadmaps, unlimited AI diagnostic assessments, realistic mock interviews, and verified skill proofs.",
  },
};

const PricingPage = () => {
  return (
    <div className="min-h-screen transition-transform duration-700 pt-16">
      <Pricing />
    </div>
  );
};

export default PricingPage;
