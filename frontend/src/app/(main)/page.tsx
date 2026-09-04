import HeroSection from "@/src/components/home/banner/HeroSection";
import TestimonialSection from "@/src/components/home/testimonial/TestimonialSection";
import CTASection from "@/src/components/home/cta/CTASection";
import HowItWorksSection from "@/src/components/home/howItWorks/HowItWorksSection";
import CareerTwinSection from "@/src/components/home/careerTwin/CareerTwinSection";
import ProblemBreakdown from "@/src/components/home/problem-breakdown/ProblemBreakdown/ProblemBreakdown";
import ProgressBridgeSection from "@/src/components/home/ProgressBridge/ProgressBridgeSection";
import Pricing from "@/src/components/home/pricing/Pricing";
import { HomeFloatingChat } from "@/src/components/chat/HomeFloatingChat";
import { FloatingSocials } from "@/src/components/socials/FloatingSocials";
import FeaturesSection from "@/src/components/home/features";
import Comparison from "@/src/components/home/comparison/Comparison";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Pather — AI-Powered Career Learning Platform",
  description:
    "Accelerate your tech career with AI Pather. Get personalized learning roadmaps, AI-driven skill assessments, and mock interviews to land your dream job.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AI Pather — AI-Powered Career Learning Platform",
    description:
      "Accelerate your tech career with AI Pather. Get personalized learning roadmaps, AI-driven skill assessments, and mock interviews to land your dream job.",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProgressBridgeSection />
      <ProblemBreakdown />      
      <HowItWorksSection />
      <CareerTwinSection />
      <FeaturesSection />
      <Comparison />
      <Pricing />
      <TestimonialSection />
      <CTASection />
      <HomeFloatingChat />
      <FloatingSocials />
    </>
  );
}
