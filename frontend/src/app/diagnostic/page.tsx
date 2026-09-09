import Diagnostic from "@/src/components/diagnostic/Diagnostic";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Diagnostic",
  description: "Evaluate your current tech skills with our free AI diagnostic tool and instantly receive a personalized career growth roadmap.",
  alternates: {
    canonical: "/diagnostic",
  }
};

const DiagnosticPage = () => {
  return (
    <section className="min-h-screen transition-transform duration-300">
      <Diagnostic />
    </section>
  );
};

export default DiagnosticPage;