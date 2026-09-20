"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FiPlus,
  FiMail,
  FiMessageCircle,
  FiChevronRight,
} from "react-icons/fi";
import type { FaqItem } from "@/src/data/faqs";

interface FaqSectionProps {
  items: FaqItem[];
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: string;
  categories?: string[];
  showCta?: boolean;
  headingLevel?: "h1" | "h2";
  className?: string;
}

export default function FaqSection({
  items,
  eyebrow = "Frequently Asked Questions",
  title = (
    <>
      Everything You Need to{" "}
      <span className="text-primary">Know About AI Pather</span>
    </>
  ),
  subtitle = "Quick, honest answers to the questions we hear most often. Can&apos;t find what you&apos;re looking for? Reach out — we reply fast.",
  showCta = true,
  headingLevel: Heading = "h2",
  className = "",
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) =>
    setOpenIndex((prev) => (prev === index ? null : index));

  return (
    <section className={`relative w-full overflow-hidden ${className}`}>
      {/* Ambient glow + grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[90%] w-[1100px] rounded-[100%] bg-primary/15 blur-[140px] pointer-events-none -z-10" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.03] -z-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(var(--foreground) / 0.4) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      <div className="global-pos px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3.5 py-1 font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </span>
          <Heading className="section-title mt-4">{title}</Heading>
          {subtitle && (
            <p className="section-subtitle mt-1">{subtitle}</p>
          )}
        </div>

        

        {/* FAQ accordion */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex flex-col gap-3">
            {items.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.question}
                  className={`dashboard-card overflow-hidden transition-all duration-300 ${
                    isOpen ? "border-primary/40 ring-1 ring-primary/20" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                  >
                    <span className="flex items-center gap-3 font-poppins text-sm font-bold text-foreground sm:text-base">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FiMessageCircle className="size-3.5" />
                      </span>
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isOpen
                          ? "bg-primary text-white"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <FiPlus className="size-4" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 pl-[3.5rem] font-poppins text-sm leading-relaxed text-muted-foreground sm:pl-[3.75rem]">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        {showCta && (
          <div className="mx-auto mt-10 max-w-3xl">
            <a
              href="/contact"
              className="group flex items-center justify-center gap-2 rounded-2xl border border-primary/25 bg-primary/5 px-6 py-4 font-poppins text-sm font-bold text-primary transition-all hover:border-primary/50 hover:bg-primary/10"
            >
              <FiMail className="size-4" />
              Still have questions? Contact us
              <FiChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}