import Diagnostic from "@/src/components/diagnostic/Diagnostic";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Career Diagnostic",
  description:
    "Evaluate your current tech skills with our free AI diagnostic tool and instantly receive a personalized career growth roadmap.",
  alternates: {
    canonical: "/diagnostic",
  },
  openGraph: {
    title: "AI Career Diagnostic | AI Pather",
    description:
      "Evaluate your current tech skills with our free AI diagnostic tool and instantly receive a personalized career growth roadmap.",
    url: "/diagnostic",
    siteName: "AI Pather",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Career Diagnostic | AI Pather",
    description:
      "Evaluate your current tech skills with our free AI diagnostic tool and instantly receive a personalized career growth roadmap.",
  },
};

const DiagnosticPage = () => {
  return (
    <section className="min-h-screen transition-transform duration-300">
      <Diagnostic />
    </section>
  );
};

export default DiagnosticPage;