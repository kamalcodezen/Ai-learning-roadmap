import HeroSection from "@/src/components/home/banner/HeroSection";
import TestimonialSection from "@/src/components/home/testimonial/TestimonialSection";
import CTASection from "@/src/components/home/cta/CTASection";
import HowItWorksSection from "@/src/components/home/howItWorks/HowItWorksSection";
import CareerTwinSection from "@/src/components/home/careerTwin/CareerTwinSection";
import AdaptivePaceSection from "@/src/components/home/adaptivePace/AdaptivePaceSection";
import ProblemBreakdown from "@/src/components/home/problem-breakdown/ProblemBreakdown/ProblemBreakdown";
import Pricing from "@/src/components/home/pricing/Pricing";
import { FloatingSocials } from "@/src/components/socials/FloatingSocials";
import FeaturesSection from "@/src/components/home/features";
import Comparison from "@/src/components/home/comparison/Comparison";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "AI Pather — AI-Powered Tech Career Learning Platform",
  },
  description:
    "Accelerate your tech career with AI Pather. Discover personalized adaptive roadmaps, AI-driven skill diagnostic assessments, proof-verified projects, and real-time interview prep.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AI Pather — AI-Powered Tech Career Learning Platform",
    description:
      "Accelerate your tech career with AI Pather. Discover personalized adaptive roadmaps, AI-driven skill diagnostic assessments, proof-verified projects, and real-time interview prep.",
    url: "/",
    siteName: "AI Pather",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Pather — AI-Powered Tech Career Learning Platform",
    description:
      "Accelerate your tech career with AI Pather. Discover personalized adaptive roadmaps, AI-driven skill diagnostic assessments, proof-verified projects, and real-time interview prep.",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemBreakdown />
      <CareerTwinSection />
      <AdaptivePaceSection />
      <FeaturesSection />
      <HowItWorksSection />
      <Comparison />
      <Pricing />
      <TestimonialSection />
      <CTASection />
      <FloatingSocials />
    </>
  );
}
