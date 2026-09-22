import type { Metadata } from "next";
import FaqSection from "@/src/components/faq/FaqSection";
import { mainFaqs } from "@/src/data/faqs";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about AI Pather — how our AI skill diagnostics, personalized learning paths, cryptographic proof graph, and subscription tiers work.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions (FAQ) | AI Pather",
    description:
      "Find answers to common questions about AI Pather — how our AI skill diagnostics, personalized learning paths, cryptographic proof graph, and subscription tiers work.",
    url: "/faq",
    siteName: "AI Pather",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions (FAQ) | AI Pather",
    description:
      "Find answers to common questions about AI Pather — how our AI skill diagnostics, personalized learning paths, cryptographic proof graph, and subscription tiers work.",
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