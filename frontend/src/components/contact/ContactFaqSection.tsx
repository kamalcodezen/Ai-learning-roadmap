"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { FiChevronDown, FiHelpCircle } from "react-icons/fi";

const faqs = [
  {
    question: "How quickly does the AI Pather team respond?",
    answer:
      "We respond to all learner and general inquiries within 24 hours. Enterprise and priority support tickets are typically reviewed and answered within 2 to 4 business hours.",
  },
  {
    question: "How do I report an issue with an AI-generated roadmap or assessment?",
    answer:
      "You can select the 'Bug Report & Feedback' category in our contact form above, or email us directly at support@aipather.com. Providing your roadmap ID or registered email allows our engineering team to inspect the generation trace and resolve it immediately.",
  },
  {
    question: "Can universities or enterprise teams request custom capability benchmarks?",
    answer:
      "Yes! We provide custom skill-gap taxonomies, cohort verification dashboards, and enterprise team licensing. Reach out to enterprise@aipather.com or choose 'Enterprise & Licensing' in the contact form to speak with our solutions architect.",
  },
  {
    question: "Where can I share feedback or feature suggestions?",
    answer:
      "We value community feedback deeply! You can submit suggestions via the contact form under 'General Inquiry' or join our active community channels to discuss ideas with our core product developers.",
  },
  {
    question: "How does AI Pather ensure my learning and personal data is secure?",
    answer:
      "All assessments, learning traces, and diagnostic evaluations are encrypted end-to-end. We adhere to strict data privacy principles and never share or sell personal learning telemetry to third parties.",
  },
];

export default function ContactFaqSection() {
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="relative w-full pb-24 sm:pb-28">
      <div className="global-pos px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 backdrop-blur-md mb-4">
              <FiHelpCircle className="size-3.5 text-primary" />
              <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Quick Answers
              </span>
            </div>

            <h2 className="font-poppins text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>

            <p className="mt-3 font-poppins text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Find immediate clarity on common questions about platform support, enterprise access, and learning diagnostics.
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <motion.div
                  key={faq.question}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className={`rounded-2xl border transition-all duration-300 backdrop-blur-md overflow-hidden ${
                    isOpen
                      ? "border-primary/50 bg-card/90"
                      : "border-border/80 bg-card/60 hover:border-primary/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <span className="font-poppins text-base sm:text-lg font-bold text-foreground">
                      {faq.question}
                    </span>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card text-muted-foreground transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-primary border-primary/40 bg-primary/10" : ""
                      }`}
                    >
                      <FiChevronDown className="size-4" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-border/50">
                          <p className="font-poppins text-sm sm:text-base text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
