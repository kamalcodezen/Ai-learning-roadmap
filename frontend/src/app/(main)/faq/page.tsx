import type { Metadata } from "next";
import FaqSection from "@/src/components/faq/FaqSection";
import { mainFaqs } from "@/src/data/faqs";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the most common questions about AI Pather — how our AI skill diagnostics, personalized roadmaps, career proof, and subscription plans work.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "AI Pather | FAQ",
    description:
      "Everything you need to know about AI Pather's diagnostics, roadmaps, proof system, and pricing.",
    type: "website",
  },
};

export default function FaqPage() {
  return (
    <FaqSection
      items={mainFaqs}
      headingLevel="h1"
      className="pt-28 sm:pt-32 pb-12 sm:pb-16"
    />
  );
}