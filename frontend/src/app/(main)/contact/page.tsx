import type { Metadata } from "next";
import ContactHero from "@/src/components/contact/ContactHero";
import ContactInfoCards from "@/src/components/contact/ContactInfoCards";
import ContactFormSection from "@/src/components/contact/ContactFormSection";
import FaqSection from "@/src/components/faq/FaqSection";
import type { FaqItem } from "@/src/data/faqs";
import { FloatingSocials } from "@/src/components/socials/FloatingSocials";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the AI Pather team. Reach out for technical support, adaptive roadmap guidance, enterprise capability benchmarks, or general inquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "AI Pather | Contact Us",
    description:
      "Get in touch with the AI Pather team for technical support, adaptive roadmap guidance, and enterprise solutions.",
    type: "website",
  },
};

const contactFaqs: FaqItem[] = [
  {
    question: "How do I reset my learning progress?",
    answer:
      "You can reset your progress from the dashboard settings. Navigate to Settings > Learning Progress and click Reset to start fresh.",
  },
  {
    question: "Can I switch my career track after starting?",
    answer:
      "Yes, you can switch tracks at any time. Your completed milestones will be saved and mapped to your new track.",
  },
  {
    question: "How does the AI coach personalize my roadmap?",
    answer:
      "The AI coach analyzes your skill assessment results, learning pace, and career goals to dynamically adjust your roadmap priorities and recommendations.",
  },
  {
    question: "Is there a mobile app available?",
    answer:
      "AI Pather is currently available as a responsive web application. A dedicated mobile app is on our roadmap for future release.",
  },
  {
    question: "How do I contact support for enterprise inquiries?",
    answer:
      "For enterprise inquiries, use the contact form above or email us directly at enterprise@aipather.com. Our team will respond within 24 hours.",
  },
];

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
      <FaqSection title="Frequently Asked Questions" items={contactFaqs} />

      {/* Floating Assist Widgets */}
      <FloatingSocials />
    </div>
  );
}
