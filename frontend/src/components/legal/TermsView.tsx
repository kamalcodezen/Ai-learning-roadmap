"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Scale,
  Code2,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Mail,
  CheckCircle2,
  Search,
  Printer,
  Share2,
  Check,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  FileText,
  type LucideIcon,
} from "lucide-react";

interface Highlight {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Section {
  id: string;
  number: string;
  title: string;
  category: string;
  content: React.ReactNode;
}

const highlights: Highlight[] = [
  {
    icon: Code2,
    title: "100% User Code Ownership",
    description:
      "You retain absolute intellectual property ownership of all source code, software architectures, and projects you import or develop.",
  },
  {
    icon: Scale,
    title: "Transparent Subscriptions",
    description:
      "All paid plans (Plus & Pro) are billed cleanly via Stripe with instant one-click cancellation and clear renewal terms.",
  },
  {
    icon: ShieldAlert,
    title: "Objective AI Benchmarks",
    description:
      "Readiness scores, architectural code reviews, and ATS assessments are diagnostic guidance tools designed to accelerate your growth.",
  },
  {
    icon: FileText,
    title: "Fair Platform Conduct",
    description:
      "Community members commit to authentic mock interviews and assessments, avoiding automated bot abuse or credential sharing.",
  },
];

const sections: Section[] = [
  {
    id: "acceptance-of-terms",
    number: "01",
    title: "Acceptance of Terms",
    category: "Agreement",
    content: (
      <p className="leading-relaxed text-muted-foreground">
        By accessing or using AI Pather (accessible via aipather.com, related
        subdomains, and applications), you agree to be bound by these Terms of
        Service and our Privacy Policy. If you do not agree with any portion of
        these terms, you must discontinue platform use immediately.
      </p>
    ),
  },
  {
    id: "services-provided",
    number: "02",
    title: "Services & Platform Scope",
    category: "Platform",
    content: (
      <div className="space-y-3">
        <p className="leading-relaxed text-muted-foreground">
          AI Pather is an AI-powered career readiness and technical learning
          platform designed to help software engineers navigate their technical
          growth through:
        </p>
        <ul className="space-y-2 text-muted-foreground text-xs sm:text-sm pl-4 list-disc">
          <li>
            Adaptive, personalized career learning roadmaps and milestone
            tracking.
          </li>
          <li>
            Comprehensive technical diagnostics isolating fundamental knowledge,
            practical execution, and problem-solving.
          </li>
          <li>
            Automated architectural audits of public GitHub repositories for
            portfolio validation.
          </li>
          <li>
            Voice-enabled AI mock interview simulations with
            question-by-question Rubric scoring.
          </li>
          <li>
            ATS resume analysis, job description matching, and cryptographic
            proof verification passports.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "user-accounts",
    number: "03",
    title: "Account Registration & Security",
    category: "Accounts",
    content: (
      <div className="space-y-3">
        <p className="leading-relaxed text-muted-foreground">
          To unlock the full suite of career tools, you must register an
          account. You agree to:
        </p>
        <ul className="space-y-2 text-muted-foreground text-xs sm:text-sm pl-4 list-disc">
          <li>
            Provide accurate, current, and authentic registration information.
          </li>
          <li>
            Maintain the confidentiality of your session tokens and
            authentication credentials.
          </li>
          <li>
            Notify AI Pather immediately of any unauthorized account access or
            security breaches.
          </li>
          <li>
            Not share, transfer, or sell your account access to third parties.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "intellectual-property",
    number: "04",
    title: "Intellectual Property & Code Ownership",
    category: "Intellectual Property",
    content: (
      <div className="space-y-4">
        <div className="p-4 rounded-xl border border-primary/25 bg-primary/5 space-y-2">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            100% User Code Ownership
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All code repositories, software designs, portfolio projects, and
            solutions you submit or import belong entirely to you. AI Pather
            claims no copyright or proprietary ownership over your work.
          </p>
        </div>
        <p className="leading-relaxed text-muted-foreground text-xs sm:text-sm">
          You grant AI Pather a temporary, non-exclusive, revocable license
          strictly to parse, analyze, compile, and compute evidence scores on
          your submissions to deliver platform functionality.
        </p>
      </div>
    ),
  },
  {
    id: "subscriptions-billing",
    number: "05",
    title: "Subscriptions, Billing & Cancellations",
    category: "Billing",
    content: (
      <div className="space-y-3">
        <p className="leading-relaxed text-muted-foreground">
          Certain features—including unlimited architectural audits, advanced
          mock interviews, and career twin simulations—require an active paid
          subscription (Plus or Pro plan):
        </p>
        <ul className="space-y-2 text-muted-foreground text-xs sm:text-sm pl-4 list-disc">
          <li>
            <strong className="text-foreground">Billing:</strong> Subscriptions
            are billed on a recurring monthly or yearly cycle via Stripe.
          </li>
          <li>
            <strong className="text-foreground">Cancellation:</strong> You can
            cancel your subscription at any time through your Profile &amp;
            Billing settings. Access remains active through the end of your
            prepaid billing period.
          </li>
          <li>
            <strong className="text-foreground">Refunds:</strong> We provide
            transparent billing. If you experience technical failure or issues
            within 7 days of initial subscription, please contact support for
            review.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "prohibited-conduct",
    number: "06",
    title: "Prohibited Platform Conduct",
    category: "Compliance",
    content: (
      <div className="space-y-3">
        <p className="leading-relaxed text-muted-foreground">
          When interacting with AI Pather, you agree not to:
        </p>
        <ul className="space-y-2 text-muted-foreground text-xs sm:text-sm pl-4 list-disc">
          <li>
            Use automated bots, scrapers, or scripts to harvest platform
            proprietary curricula or interview challenge banks.
          </li>
          <li>
            Attempt to reverse-engineer, decompile, or tamper with the
            cryptographic proof verification mechanism.
          </li>
          <li>
            Submit malicious code, vulnerabilities, or automated exploits
            through repository imports.
          </li>
          <li>
            Abuse or overload our AI inference endpoints beyond reasonable human
            learning interaction.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "disclaimers-advisory",
    number: "07",
    title: "Disclaimers & Advisory Nature",
    category: "Legal Scope",
    content: (
      <p className="leading-relaxed text-muted-foreground">
        AI Pather delivers career intelligence, technical assessments, and
        interview practice tools to empower your preparation. However,
        Application Readiness scores and Career Twin predictions are advisory
        benchmarks. AI Pather does not guarantee specific employment offers, job
        placements, or compensation packages, as final hiring decisions remain
        solely at the discretion of third-party employers.
      </p>
    ),
  },
  {
    id: "contact-support",
    number: "08",
    title: "Contact & Legal Support",
    category: "Contact",
    content: (
      <div className="space-y-4">
        <p className="leading-relaxed text-muted-foreground">
          For legal inquiries, billing clarification, or terms questions, our
          support team is readily available:
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Legal &amp; Compliance Team
              </p>
              <a
                href="mailto:legal@aipather.com"
                className="text-sm font-bold text-foreground hover:text-primary transition-colors"
              >
                legal@aipather.com
              </a>
            </div>
          </div>
          <a
            href="mailto:legal@aipather.com"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
          >
            Contact Legal <ExternalLink className="w-3 h-3 text-white" />
          </a>
        </div>
      </div>
    ),
  },
];

export default function TermsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("acceptance-of-terms");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter sections dynamically based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.toLowerCase();
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/terms#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden py-12 px-4 sm:px-6 lg:px-8 pt-26">
      {/* Soft Ambient Glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 blur-[130px] rounded-full" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-10">
        {/* Top Navigation Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1.5 px-3 rounded-lg border border-border bg-card/60 backdrop-blur-sm shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground py-1.5 px-3 rounded-lg border border-border bg-card/60 backdrop-blur-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-primary" />
              Print Terms
            </button>
            <button
              type="button"
              onClick={() => handleCopyLink("top")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground py-1.5 px-3 rounded-lg border border-border bg-card/60 backdrop-blur-sm transition-colors cursor-pointer"
            >
              {copiedId === "top" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">
                    Link Copied!
                  </span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-primary" />
                  Share
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Header Card using dashboard-card */}
        <div className="dashboard-card !p-8 sm:!p-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 border border-primary/20 text-primary">
              <Scale className="w-3.5 h-3.5" />
              Platform Terms of Service
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              Version 2.0 • Effective September 2026
            </div>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground text-balance">
              Terms of Service
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Transparent terms governing your access to AI Pather&apos;s
              roadmaps, skill diagnostics, portfolio audits, and subscription
              tiers.
            </p>
          </div>

          {/* Dynamic Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clauses, topics, or keywords (e.g. ownership, refunds, cancellation)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card-soft text-foreground placeholder:text-muted-foreground text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Highlights Grid using dashboard-card & dashboard-card-gap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 dashboard-card-gap">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <div
                key={i}
                className="dashboard-card !p-5 flex flex-col justify-between space-y-3 hover:border-primary/40 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-foreground">
                    {h.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {h.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2-Column Main Layout: Sticky Sidebar TOC + Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sticky TOC & Quick Actions */}
          <aside className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="dashboard-card !p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Table of Contents
                </span>
                <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  {filteredSections.length} Sections
                </span>
              </div>

              <nav className="space-y-1">
                {filteredSections.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-primary/15 text-primary font-bold shadow-xs translate-x-1"
                          : "text-muted-foreground hover:bg-card-soft hover:text-foreground"
                      }`}
                    >
                      <span className="truncate">
                        <span className="opacity-60 mr-1.5 font-mono">
                          {section.number}.
                        </span>
                        {section.title}
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform shrink-0 ${
                          isActive ? "rotate-90 text-primary" : "opacity-40"
                        }`}
                      />
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Quick Contact Box */}
            <div className="dashboard-card !p-5 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                <HelpCircle className="w-4 h-4 text-primary" />
                Billing &amp; Terms Inquiries
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Have questions regarding plan terms, invoices, or enterprise
                licenses?
              </p>
              <a
                href="mailto:legal@aipather.com"
                className="inline-flex w-full items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg border border-border bg-card hover:bg-card-soft text-foreground hover:text-primary transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-primary" />
                legal@aipather.com
              </a>
            </div>
          </aside>

          {/* Right Column: Detailed Sections */}
          <main className="lg:col-span-8 space-y-6">
            {filteredSections.length === 0 ? (
              <div className="dashboard-card !p-12 text-center space-y-3">
                <Search className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-bold text-foreground">
                  No matching sections found
                </p>
                <p className="text-xs text-muted-foreground">
                  Try searching for different keywords like &quot;billing&quot;,
                  &quot;ownership&quot;, or &quot;refund&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              filteredSections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="dashboard-card !p-6 sm:!p-8 space-y-4 scroll-mt-28"
                >
                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-border/80">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-primary">
                        <span>Section {section.number}</span>
                        <span>•</span>
                        <span className="text-muted-foreground">
                          {section.category}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-foreground">
                        {section.title}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(section.id)}
                      title="Copy section link"
                      className="p-1.5 rounded-lg border border-border bg-card/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                    >
                      {copiedId === section.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm">{section.content}</div>
                </section>
              ))
            )}

            {/* Bottom Trust Pledge Card */}
            <div className="dashboard-card !p-8 text-center space-y-3 border-primary/30">
              <Sparkles className="w-7 h-7 text-primary mx-auto" />
              <h3 className="text-base font-bold text-foreground">
                Fair, Transparent, and Empowering
              </h3>
              <p className="text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
                We are committed to providing an empowering, respectful, and
                transparent platform for engineers and lifelong learners around
                the globe.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
