import HeroSection from "@/src/components/home/banner/HeroSection";
import HowItWorksSection from "@/src/components/home/howItWorks/HowItWorksSection";
import ProblemBreakdown from "@/src/components/home/problem-breakdown/ProblemBreakdown/ProblemBreakdown";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemBreakdown />
      <HowItWorksSection />
    </>
  );
}
