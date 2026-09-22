import type { Metadata } from "next";
import PrivacyView from "@/src/components/legal/PrivacyView";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read AI Pather's Privacy Policy to understand how we secure your data, protect user repository code, and maintain strict privacy standards with zero unauthorized AI model training.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | AI Pather",
    description:
      "Read AI Pather's Privacy Policy to understand how we secure your data, protect user repository code, and maintain strict privacy standards with zero unauthorized AI model training.",
    url: "/privacy",
    siteName: "AI Pather",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | AI Pather",
    description:
      "Read AI Pather's Privacy Policy to understand how we secure your data, protect user repository code, and maintain strict privacy standards with zero unauthorized AI model training.",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyView />;
}
