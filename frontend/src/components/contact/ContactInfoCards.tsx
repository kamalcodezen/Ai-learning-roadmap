"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  FiLifeBuoy,
  FiBriefcase,
  FiUsers,
  FiMail,
  FiCopy,
  FiCheck,
  FiArrowUpRight,
} from "react-icons/fi";

const channels = [
  {
    icon: FiLifeBuoy,
    badge: "Support & Diagnostics",
    title: "Learner & Tech Support",
    description:
      "Get help with roadmap generation, milestone diagnostics, proof graph verification, or account settings.",
    email: "support@aipather.com",
    actionType: "email",
  },
  {
    icon: FiBriefcase,
    badge: "Enterprise & Scale",
    title: "Enterprise & Partnerships",
    description:
      "Discuss custom capability benchmarks, cohort tracking for engineering teams, university access, and licensing.",
    email: "enterprise@aipather.com",
    actionType: "email",
  },
  {
    icon: FiUsers,
    badge: "Collaborate & Grow",
    title: "Community & Builders",
    description:
      "Join the AI Pather learner ecosystem, share verified project proofs, discuss roadmap trends, and give live feedback.",
    email: "community@aipather.com",
    actionType: "email",
  },
];

export default function ContactInfoCards() {
  const shouldReduceMotion = useReducedMotion();
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopy = (email: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <section className="relative w-full pb-16">
      <div className="global-pos px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {channels.map((channel, index) => {
            const Icon = channel.icon;
            const isCopied = copiedEmail === channel.email;

            return (
              <motion.div
                key={channel.title}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="dashboard-card group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/70 p-6 sm:p-7 backdrop-blur-md transition-all duration-300 hover:border-primary/50 shadow-none"
              >
                {/* Glow overlay on hover */}
                <div className="absolute inset-0 rounded-2xl  bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-6" />
                    </div>
                    <span className="font-poppins text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border/50">
                      {channel.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-poppins text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {channel.title}
                  </h3>
                  <p className="mt-2 font-poppins text-sm text-muted-foreground leading-relaxed">
                    {channel.description}
                  </p>
                </div>

                {/* Bottom Action Area */}
                <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between gap-2">
                  <a
                    href={`mailto:${channel.email}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors group/link"
                  >
                    <FiMail className="size-4 text-primary" />
                    <span className="truncate">{channel.email}</span>
                    <FiArrowUpRight className="size-3.5 opacity-60 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all" />
                  </a>

                  {/* Quick Copy Button */}
                  <button
                    type="button"
                    onClick={(e) => handleCopy(channel.email, e)}
                    title={isCopied ? "Copied!" : "Copy email"}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-card hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all cursor-pointer shrink-0"
                  >
                    {isCopied ? (
                      <FiCheck className="size-4 text-emerald-500" />
                    ) : (
                      <FiCopy className="size-3.5" />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
