
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  FiPlus,
  FiMinus,
  FiHelpCircle,
} from "react-icons/fi";

const faqs = [
  {
    question: "How quickly does the AI Pather team respond?",
    answer:
      "We respond to all learner and general inquiries within 24 hours. Enterprise and priority support tickets are typically reviewed and answered within 2 to 4 business hours.",
  },
  {
    question:
      "How do I report an issue with an AI-generated roadmap or assessment?",
    answer:
      "You can select the 'Bug Report & Feedback' category in our contact form above, or email us directly at support@aipather.com. Providing your roadmap ID or registered email allows our engineering team to inspect the generation trace and resolve it immediately.",
  },
  {
    question:
      "Can universities or enterprise teams request custom capability benchmarks?",
    answer:
      "Yes! We provide custom skill-gap taxonomies, cohort verification dashboards, and enterprise team licensing. Reach out to enterprise@aipather.com or choose 'Enterprise & Licensing' in the contact form to speak with our solutions architect.",
  },
  {
    question: "Where can I share feedback or feature suggestions?",
    answer:
      "We value community feedback deeply! You can submit suggestions via the contact form under 'General Inquiry' or join our active community channels to discuss ideas with our core product developers.",
  },
  {
    question:
      "How does AI Pather ensure my learning and personal data is secure?",
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
        <div className="mx-auto max-w-4xl">

          {/* Header */}
          <div className="mb-12 flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 backdrop-blur-md">
              <FiHelpCircle className="size-3.5 text-primary" />

              <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Quick Answers
              </span>
            </div>

            <h2 className="font-poppins text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>

            <p className="mx-auto mt-3 max-w-xl font-poppins text-sm text-muted-foreground sm:text-base">
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
                  initial={
                    shouldReduceMotion
                      ? {}
                      : { opacity: 0, y: 15 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                  }}
                  className={`overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-300 ${
                    isOpen
                      ? "border-primary/50 bg-card/90"
                      : "border-border/80 bg-card/60 hover:border-primary/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="flex w-full cursor-pointer select-none items-center justify-between gap-4 p-5 text-left sm:p-6"
                    aria-expanded={isOpen}
                  >
                    <span className="font-poppins text-base font-bold text-foreground sm:text-lg">
                      {faq.question}
                    </span>

                    {/* Plus / Minus Icon */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card text-muted-foreground transition-all duration-300 ${
                        isOpen
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : ""
                      }`}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isOpen ? (
                          <motion.div
                            key="minus"
                            initial={
                              shouldReduceMotion
                                ? { opacity: 0 }
                                : { rotate: 0, opacity: 0 }
                            }
                            animate={
                              shouldReduceMotion
                                ? { opacity: 1 }
                                : { rotate: 360, opacity: 1 }
                            }
                            exit={
                              shouldReduceMotion
                                ? { opacity: 0 }
                                : { rotate: -360, opacity: 0 }
                            }
                            transition={{
                              duration: 0.1,
                              ease: "easeInOut",
                            }}
                          >
                            <FiMinus className="size-4" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="plus"
                            initial={
                              shouldReduceMotion
                                ? { opacity: 0 }
                                : { rotate: 0, opacity: 0 }
                            }
                            animate={
                              shouldReduceMotion
                                ? { opacity: 1 }
                                : { rotate: 90, opacity: 1 }
                            }
                            exit={
                              shouldReduceMotion
                                ? { opacity: 0 }
                                : { rotate: -90, opacity: 0 }
                            }
                            transition={{
                              duration: 0.1,
                              ease: "easeInOut",
                            }}
                          >
                            <FiPlus className="size-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="border-t border-border/50 px-5 pb-6 pt-1 sm:px-6">
                          <p className="font-poppins text-sm leading-relaxed text-muted-foreground sm:text-base">
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

