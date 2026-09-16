import type { Metadata } from "next";
import ContactHero from "@/src/components/contact/ContactHero";
import ContactInfoCards from "@/src/components/contact/ContactInfoCards";
import ContactFormSection from "@/src/components/contact/ContactFormSection";
import ContactFaqSection from "@/src/components/contact/ContactFaqSection";
import { FloatingSocials } from "@/src/components/socials/FloatingSocials";

export const metadata: Metadata = {
  title: "Contact Us | AI Pather",
  description:
    "Get in touch with the AI Pather team. Reach out for technical support, adaptive roadmap guidance, enterprise capability benchmarks, or general inquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | AI Pather",
    description:
      "Get in touch with the AI Pather team for technical support, adaptive roadmap guidance, and enterprise solutions.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Hero Section */}
      <ContactHero />

      {/* Support & Channel Cards */}
      <ContactInfoCards />

      {/* Interactive Direct Message Form & Guidelines */}
      <ContactFormSection />

      {/* Common FAQ Accordion */}
      <ContactFaqSection />

      {/* Floating Assist Widgets */}
      <FloatingSocials />
    </div>
  );
}
