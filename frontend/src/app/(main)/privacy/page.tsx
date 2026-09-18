import type { Metadata } from "next";
import PrivacyView from "@/src/components/legal/PrivacyView";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how AI Pather protects your privacy, secures your code repositories, and handles your diagnostic and learning data with zero public AI model training.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "AI Pather | Privacy Policy",
    description:
      "Enterprise-grade data security, cryptographic proof integrity, and privacy governance for engineering learners.",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyView />;
}
