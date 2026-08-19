import HeroSection from "@/src/components/home/banner/HeroSection";
import TestimonialSection from "@/src/components/home/testimonial/TestimonialSection";
import CTASection from "@/src/components/home/cta/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      {/* Other sections will go here */}
      <TestimonialSection />
      <CTASection />
    </>
  );
}
