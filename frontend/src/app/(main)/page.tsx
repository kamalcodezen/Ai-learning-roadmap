import HeroSection from "@/src/components/home/banner/HeroSection";
import TestimonialSection from "@/src/components/home/testimonial/TestimonialSection";
import CTASection from "@/src/components/home/cta/CTASection";
import HowItWorksSection from "@/src/components/home/howItWorks/HowItWorksSection";
import ProblemBreakdown from "@/src/components/home/problem-breakdown/ProblemBreakdown/ProblemBreakdown";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemBreakdown />
      <HowItWorksSection />
      <TestimonialSection />
      <CTASection />
    </>
  );
}
