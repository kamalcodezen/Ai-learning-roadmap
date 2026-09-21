import type { Metadata } from "next";
import TermsView from "@/src/components/legal/TermsView";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Review the Terms and Conditions governing your use of AI Pather's career roadmaps, skill diagnostics, portfolio audits, and subscription tiers.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms & Conditions | AI Pather",
    description:
      "Review the Terms and Conditions governing your use of AI Pather's career roadmaps, skill diagnostics, portfolio audits, and subscription tiers.",
    url: "/terms",
    siteName: "AI Pather",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | AI Pather",
    description:
      "Review the Terms and Conditions governing your use of AI Pather's career roadmaps, skill diagnostics, portfolio audits, and subscription tiers.",
  },
};

export default function TermsOfServicePage() {
  return <TermsView />;
}
