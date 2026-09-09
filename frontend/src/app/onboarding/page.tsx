import Onboarding from "@/src/components/onboarding/Onboarding";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding",
  robots: { index: false, follow: false },
};

const OnboardingPage = () => {
  return (
    <section className="min-h-screen transition-transform duration-300">
      <Onboarding />
    </section>
  );
};

export default OnboardingPage;
