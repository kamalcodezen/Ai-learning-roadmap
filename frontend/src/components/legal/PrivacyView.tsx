"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Cpu,
  UserCheck,
  Sparkles,
  ArrowLeft,
  Mail,
  Search,
  Printer,
  Share2,
  Check,
  ChevronRight,
  ExternalLink,
  Shield,
  Database,
  FileCheck2,
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
    icon: EyeOff,
    title: "Zero AI Model Training",
    description:
      "Your private code repositories, diagnostic answers, and mock interview voice recordings are never used to train public AI models.",
  },
  {
    icon: Lock,
    title: "Cryptographic Evidence",
    description:
      "Proof Graph passports and skill verification badges are cryptographically signed, creating tamper-evident candidate credentials.",
  },
  {
    icon: Cpu,
    title: "Ephemeral AI Processing",
    description:
      "Architectural audits and live interview evaluations occur in isolated, ephemeral memory environments with zero retention for training.",
  },
  {
    icon: UserCheck,
    title: "Full Data Ownership",
    description:
      "You retain 100% intellectual property ownership of your code, projects, and career assets with instant export and deletion rights.",
  },
];

const sections: Section[] = [
  {
    id: "information-we-collect",
    number: "01",
    title: "Information We Collect",
    category: "Data Collection",
    content: (
      <div className="space-y-4">
        <p className="leading-relaxed text-muted-foreground">
          To generate personalized career roadmaps, automated architectural
          audits, and dynamic interview simulations, AI Pather processes the
          following data categories:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-lg border border-border bg-card/60 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              Account Credentials
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Full name, email address, profile avatar, and authentication
              identifiers secured via encrypted session tokens.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-card/60 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-primary" />
              Diagnostic Submissions
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Diagnostic test responses, problem-solving code submissions, and
              milestone roadmap progress metrics.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-card/60 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-primary" />
              Repository Metadata
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Public GitHub repository URLs, file trees, commit metadata, and
              test coverage imported for portfolio depth audits.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-card/60 space-y-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              Interview Transcripts
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Audio input and text transcripts generated during AI mock
              interview practice sessions for rubric grading.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "how-we-use-information",
    number: "02",
    title: "How We Use Your Information",
    category: "Data Usage",
    content: (
      <div className="space-y-3">
        <p className="leading-relaxed text-muted-foreground">
          We use your data solely to deliver, calibrate, and elevate your
          personal engineering learning experience:
        </p>
        <ul className="space-y-2 text-muted-foreground text-xs sm:text-sm pl-4 list-disc">
          <li>
            To diagnose skill gaps and dynamically generate tailored milestone
            roadmaps.
          </li>
          <li>
            To calculate your objective{" "}
            <strong className="text-foreground font-semibold">
              Application Readiness Score
            </strong>{" "}
            across knowledge, practical, and project dimensions.
          </li>
          <li>
            To perform deep architectural code reviews on your imported GitHub
            repositories.
          </li>
          <li>
            To power your real-time AI Career Twin simulator and simulate
            industry interview panels.
          </li>
          <li>
            To generate verifiable cryptographic proof graphs you can safely
            share with hiring managers.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "ai-governance",
    number: "03",
    title: "AI Governance & Code Sovereignty",
    category: "AI Security",
    content: (
      <div className="space-y-4">
        <p className="leading-relaxed text-muted-foreground">
          AI Pather operates under strict enterprise AI data governance and code
          confidentiality:
        </p>
        <div className="p-4 rounded-xl border border-primary/25 bg-primary/5 space-y-2">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Strict Non-Training Guarantee
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your proprietary source code, resume bullet points, and mock
            interview answers are evaluated via isolated API inference endpoints
            configured with zero data retention for training. No model weights
            or public LLMs learn from your submissions.
          </p>
        </div>
        <p className="leading-relaxed text-muted-foreground text-xs sm:text-sm">
          All analysis outputs (e.g. ATS match scores, architectural
          suggestions, rubric breakdowns) belong exclusively to you as
          actionable private career intelligence.
        </p>
      </div>
    ),
  },
  {
    id: "third-party-services",
    number: "04",
    title: "Third-Party Services & Integrations",
    category: "Integrations",
    content: (
      <div className="space-y-3">
        <p className="leading-relaxed text-muted-foreground">
          We do not sell, rent, or monetize your personal information. We
          integrate only with essential, high-trust infrastructure partners:
        </p>
        <ul className="space-y-2 text-muted-foreground text-xs sm:text-sm pl-4 list-disc">
          <li>
            <strong className="text-foreground">GitHub API:</strong> Fetches
            repository source files and commit trees strictly upon your explicit
            authorization.
          </li>
          <li>
            <strong className="text-foreground">Stripe:</strong> Processes
            encrypted subscription transactions and billing management under
            PCI-DSS compliance.
          </li>
          <li>
            <strong className="text-foreground">Cloudflare:</strong> Delivers
            secure TLS 1.3 encrypted data transmission, DDoS mitigation, and
            edge safety.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "user-rights",
    number: "05",
    title: "Your Rights & Data Retention",
    category: "User Rights",
    content: (
      <div className="space-y-3">
        <p className="leading-relaxed text-muted-foreground">
          Regardless of your physical jurisdiction (including full alignment
          with GDPR and CCPA guidelines), you hold complete sovereignty over
          your data:
        </p>
        <ul className="space-y-2 text-muted-foreground text-xs sm:text-sm pl-4 list-disc">
          <li>
            <strong className="text-foreground">Export:</strong> Download your
            diagnostic reports, resume ATS scorecards, and audit logs at any
            time.
          </li>
          <li>
            <strong className="text-foreground">Correction:</strong> Update your
            career target role, experience level, and project links from your
            profile settings.
          </li>
          <li>
            <strong className="text-foreground">Permanent Erasure:</strong>{" "}
            Request the permanent deletion of your profile, skill state records,
            and stored repository audits by contacting our team.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "security-contact",
    number: "06",
    title: "Security Inquiries & Support",
    category: "Contact",
    content: (
      <div className="space-y-4">
        <p className="leading-relaxed text-muted-foreground">
          If you have questions about this Privacy Policy, our data encryption
          protocols, or wish to exercise your data rights, please reach out
          directly:
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Privacy & Security Officer
              </p>
              <a
                href="mailto:privacy@aipather.com"
                className="text-sm font-bold text-foreground hover:text-primary transition-colors"
              >
                privacy@aipather.com
              </a>
            </div>
          </div>
          <a
            href="mailto:privacy@aipather.com"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Send Inquiry <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    ),
  },
];

export default function PrivacyView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("information-we-collect");
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
    const url = `${window.location.origin}/privacy#${id}`;
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
              Print Policy
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
              <ShieldCheck className="w-3.5 h-3.5" />
              Enterprise Data Governance & Privacy
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              Version 2.1 • Effective September 2026
            </div>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground text-balance">
              Privacy Policy
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              How AI Pather safeguards your source code, diagnostic evaluations,
              mock interview records, and personal identifiers with
              cryptographic integrity and zero model training.
            </p>
          </div>

          {/* Dynamic Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clauses, topics, or keywords (e.g. AI training, GitHub, export)..."
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
                <Shield className="w-4 h-4 text-primary" />
                Data Protection Officer
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Need verification for enterprise compliance or have privacy
                questions?
              </p>
              <a
                href="mailto:privacy@aipather.com"
                className="inline-flex w-full items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg border border-border bg-card hover:bg-card-soft text-foreground hover:text-primary transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-primary" />
                privacy@aipather.com
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
                  Try searching for different keywords like &quot;code&quot;,
                  &quot;training&quot;, or &quot;export&quot;.
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
                Building Careers on Trust, Zero Compromise
              </h3>
              <p className="text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
                AI Pather turns scattered learning into verifiable engineering
                ability. We protect your code, your intellectual property, and
                your career data every step of the way.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
