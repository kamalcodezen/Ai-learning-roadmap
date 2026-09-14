import type { Metadata } from "next";
import TermsView from "@/src/components/legal/TermsView";

export const metadata: Metadata = {
  title: "Terms of Service | AI Pather",
  description:
    "Review the terms and conditions governing your use of AI Pather's career roadmaps, skill diagnostics, portfolio audits, and subscription tiers.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service | AI Pather",
    description:
      "Clear, transparent terms of service, 100% user code ownership, and platform agreements for learners.",
    type: "website",
  },
};

export default function TermsOfServicePage() {
  return <TermsView />;
}
