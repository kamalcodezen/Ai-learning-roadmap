import type { Metadata } from "next";
import AboutHero from "@/src/components/about/AboutHero";
import AboutProblem from "@/src/components/about/AboutProblem";
import AboutBelief from "@/src/components/about/AboutBelief";
import AboutHowWeThink from "@/src/components/about/AboutHowWeThink";
import AboutPhilosophy from "@/src/components/about/AboutPhilosophy";
import AboutAudience from "@/src/components/about/AboutAudience";
import AboutFutureCta from "@/src/components/about/AboutFutureCta";
import ProgressBridgeSection from "@/src/components/home/ProgressBridge/ProgressBridgeSection";
import { FloatingSocials } from "@/src/components/socials/FloatingSocials";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about AI Pather's mission to bridge the tech career readiness gap. We turn scattered tutorials into verified engineering capability through diagnostic gap isolation and proof-backed learning.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | AI Pather",
    description:
      "Learn about AI Pather's mission to bridge the tech career readiness gap with precision skill diagnostics, adaptive learning roadmaps, and verified project proofs.",
    url: "/about",
    siteName: "AI Pather",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | AI Pather",
    description:
      "Learn about AI Pather's mission to bridge the tech career readiness gap with precision skill diagnostics, adaptive learning roadmaps, and verified project proofs.",
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Section 01: Hero */}
      <AboutHero />

      {/* Trajectory Pulse Bridge */}
      <ProgressBridgeSection />

      {/* Section 02: The Problem */}
      <AboutProblem />

      {/* Section 03: Our Belief */}
      <AboutBelief />

      {/* Section 04: How We Think */}
      <AboutHowWeThink />

      {/* Section 05: Our Philosophy */}
      <AboutPhilosophy />

      {/* Section 06: Who We're Building For */}
      <AboutAudience />

      {/* Section 07: The Future & CTA */}
      <AboutFutureCta />

      {/* Floating Assist Widgets */}
      <FloatingSocials />
    </div>
  );
}