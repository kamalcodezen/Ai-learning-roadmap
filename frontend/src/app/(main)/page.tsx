import HeroSection from "@/src/components/home/banner/HeroSection";
import TestimonialSection from "@/src/components/home/testimonial/TestimonialSection";
import CTASection from "@/src/components/home/cta/CTASection";
import HowItWorksSection from "@/src/components/home/howItWorks/HowItWorksSection";
import ProblemBreakdown from "@/src/components/home/problem-breakdown/ProblemBreakdown/ProblemBreakdown";
import ProgressBridgeSection from "@/src/components/home/ProgressBridge/ProgressBridgeSection";
import Pricing from "@/src/components/home/pricing/Pricing";
import Comparison from "@/src/components/home/comparison/Comparison";


export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProgressBridgeSection />
      <ProblemBreakdown />      
      <HowItWorksSection />
      <Comparison />
      <Pricing />
      <TestimonialSection />
      <CTASection />
    </>
  );
}
