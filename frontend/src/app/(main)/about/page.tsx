import type { Metadata } from "next";
import AboutHero from "@/src/components/about/AboutHero";
import AboutProblem from "@/src/components/about/AboutProblem";
import AboutBelief from "@/src/components/about/AboutBelief";
import AboutHowWeThink from "@/src/components/about/AboutHowWeThink";
import AboutPhilosophy from "@/src/components/about/AboutPhilosophy";
import AboutAudience from "@/src/components/about/AboutAudience";
import AboutFutureCta from "@/src/components/about/AboutFutureCta";
import ProgressBridgeSection from "@/src/components/home/ProgressBridge/ProgressBridgeSection";
import { HomeFloatingChat } from "@/src/components/chat/HomeFloatingChat";
import { FloatingSocials } from "@/src/components/socials/FloatingSocials";

export const metadata: Metadata = {
  title: "About Us | AI Pather — The Adaptive Career Learning System",
  description:
    "AI Pather exists to help people turn scattered learning into a clear, adaptive path toward real career capability through diagnostic gap isolation and zero-clone proof.",
  openGraph: {
    title: "About Us | AI Pather",
    description:
      "We believe learning should lead somewhere. AI Pather turns scattered learning into verified career capability.",
    type: "website",
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
      <HomeFloatingChat />
      <FloatingSocials />
    </div>
  );
}