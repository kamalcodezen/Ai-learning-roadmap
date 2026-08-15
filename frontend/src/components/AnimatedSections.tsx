"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import BannerSection from "@/src/components/BannerSection";
import BrandPartners from "@/src/components/BrandPartners";
import DiagonalMarqueeSection from "@/src/components/DiagonalMarqueeSection";
import Link from "next/link";

// Register GSAP Plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer);
}

const SECTION_LABELS = [
  "Banner & 3D Concave",
  "Diagonal Stream",
  "Key Capabilities",
  "Engineered for Scale",
  "CTA & Platform Footer",
];

export default function AnimatedSections({ isLoaderActive }: { isLoaderActive: boolean }) {
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animatingRef = useRef(false);
  const currentIndexRef = useRef(-1);
  const gotoSectionRef = useRef<((index: number, direction: number) => void) | null>(null);

  // Smooth Section Transition Function (Clamped: stops at start and final footer section)
  const navigateToSection = useCallback((targetIndex: number, direction?: number) => {
    if (!containerRef.current) return;

    const sections = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-section"),
    );
    const outerWrappers = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-section .outer-wrap"),
    );
    const innerWrappers = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-section .inner-wrap"),
    );
    const bgElements = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-section .section-bg"),
    );

    if (!sections.length) return;

    // Strict boundary clamping: do NOT wrap past Section 0 or past the final Footer Section
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    if (animatingRef.current && currentIndexRef.current === targetIndex) return;

    animatingRef.current = true;

    const prevIndex = currentIndexRef.current;
    const dir = direction !== undefined ? direction : targetIndex > prevIndex ? 1 : -1;
    const fromTop = dir === -1;
    const dFactor = fromTop ? -1 : 1;

    const tl = gsap.timeline({
      defaults: { duration: 1.15, ease: "power2.inOut" },
      onComplete: () => {
        animatingRef.current = false;
      },
    });

    if (prevIndex >= 0 && prevIndex !== targetIndex) {
      gsap.set(sections[prevIndex], { zIndex: 0 });
      tl.to(bgElements[prevIndex], { yPercent: -12 * dFactor }).set(sections[prevIndex], {
        autoAlpha: 0,
      });
    }

    gsap.set(sections[targetIndex], { autoAlpha: 1, zIndex: 1 });
    tl.fromTo(
      [outerWrappers[targetIndex], innerWrappers[targetIndex]],
      {
        yPercent: (i: number) => (i ? -100 * dFactor : 100 * dFactor),
      },
      {
        yPercent: 0,
      },
      0,
    ).fromTo(bgElements[targetIndex], { yPercent: 12 * dFactor }, { yPercent: 0 }, 0);

    currentIndexRef.current = targetIndex;
    setCurrentSection(targetIndex);
  }, []);

  useEffect(() => {
    gotoSectionRef.current = navigateToSection;
  }, [navigateToSection]);

  useEffect(() => {
    // Only initialize continuous section swipe after loader finishes
    if (isLoaderActive || !containerRef.current) return;

    const sections = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-section"),
    );
    const outerWrappers = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-section .outer-wrap"),
    );
    const innerWrappers = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-section .inner-wrap"),
    );

    if (!sections.length) return;

    // Initial setup
    gsap.set(sections, { autoAlpha: 0, zIndex: 0 });
    gsap.set(outerWrappers, { yPercent: 100 });
    gsap.set(innerWrappers, { yPercent: -100 });

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (animatingRef.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (currentIndexRef.current < sections.length - 1) {
          navigateToSection(currentIndexRef.current + 1, 1);
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (currentIndexRef.current > 0) {
          navigateToSection(currentIndexRef.current - 1, -1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Create GSAP Observer: strictly stopped right at the footer (no endless wrapping)
    const observer = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      wheelSpeed: -1,
      onDown: () => {
        if (!animatingRef.current && currentIndexRef.current > 0) {
          navigateToSection(currentIndexRef.current - 1, -1);
        }
      },
      onUp: () => {
        if (!animatingRef.current && currentIndexRef.current < sections.length - 1) {
          navigateToSection(currentIndexRef.current + 1, 1);
        }
      },
      tolerance: 10,
      preventDefault: true,
    });

    // Start at Section 0 (Banner)
    navigateToSection(0, 1);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      observer.kill();
    };
  }, [isLoaderActive, navigateToSection]);

  // Smoothly scroll back to the top section
  const scrollToTop = () => {
    if (animatingRef.current || currentSection === 0) return;
    navigateToSection(0, -1);
  };

  // Calculate circular progress (0% at Banner -> 100% at Footer)
  const totalSections = SECTION_LABELS.length;
  const progressRatio = totalSections > 1 ? currentSection / (totalSections - 1) : 0;
  const circleRadius = 22;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden bg-[#050608]">
      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 0: Banner Section + Endless 3D Concave Carousel
      ══════════════════════════════════════════════════════════════════════ */}
      {/* ── Fixed Side Navigation Dots ── */}
      <aside className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3 select-none">
        {SECTION_LABELS.map((label, idx) => {
          const isActive = currentSection === idx;
          return (
            <button
              key={idx}
              onClick={() => navigateToSection(idx)}
              className="group relative flex items-center justify-end p-2 cursor-pointer focus:outline-none"
              title={label}
            >
              {/* Floating Tooltip Label */}
              <span className="absolute right-8 px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/15 text-xs text-gray-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 pointer-events-none shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                {label}
              </span>

              {/* Indicator Dot */}
              <div
                className={`transition-all duration-500 rounded-full ${
                  isActive
                    ? "w-3 h-8 bg-gradient-to-b from-[#eb5722] to-[#38d9d4] shadow-[0_0_15px_#38d9d4]"
                    : "w-2 h-2 bg-white/30 group-hover:bg-white/70 group-hover:scale-125"
                }`}
              />
            </button>
          );
        })}
      </aside>

      {/* ── Floating Circular Scroll-to-Top Button with Glowing Progress Ring ── */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#0d0e13]/80 hover:bg-[#151720] backdrop-blur-2xl border border-white/15 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.3)] transition-all duration-500 cursor-pointer group focus:outline-none ${
          currentSection > 0
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        title="Scroll to top"
      >
        {/* SVG Circular Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1">
          {/* Background track circle */}
          <circle
            cx="24"
            cy="24"
            r={circleRadius}
            className="stroke-white/10 fill-none"
            strokeWidth="2.5"
          />
          {/* Active progress circle */}
          <circle
            cx="24"
            cy="24"
            r={circleRadius}
            className="stroke-[#38d9d4] fill-none transition-all duration-700 ease-out"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 0 6px rgba(56, 217, 212, 0.8))",
            }}
          />
        </svg>

        {/* Center Up Arrow Icon */}
        <span className="relative z-10 text-white group-hover:text-[#38d9d4] group-hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center">
          <i className="fi fi-br-angle-small-up text-xl leading-none" />
        </span>
      </button>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 0: Banner Section + Endless 3D Concave Carousel
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="animated-section fixed inset-0 w-full h-full invisible">
        <div className="outer-wrap w-full h-full overflow-hidden">
          <div className="inner-wrap w-full h-full overflow-hidden">
            <div className="section-bg w-full h-full overflow-y-auto bg-[#050608] flex flex-col justify-center pt-16 pb-12 relative">
              <BannerSection />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1: Brand Partners & Diagonal Marquee Stream
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="animated-section fixed inset-0 w-full h-full invisible">
        <div className="outer-wrap w-full h-full overflow-hidden">
          <div className="inner-wrap w-full h-full overflow-hidden">
            <div className="section-bg w-full h-full overflow-y-auto bg-[#050608] flex flex-col justify-center py-12 relative">
              <div className="w-[95%] max-w-7xl mx-auto rounded-[32px] overflow-hidden border border-white/10 bg-[#07080c] shadow-[0_25px_80px_rgba(0,0,0,0.85)] relative">
                <BrandPartners />
                <DiagonalMarqueeSection />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2: Key Capabilities & Interactive Features
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="animated-section fixed inset-0 w-full h-full invisible">
        <div className="outer-wrap w-full h-full overflow-hidden">
          <div className="inner-wrap w-full h-full overflow-hidden">
            <div className="section-bg w-full h-full overflow-y-auto bg-[#050608] flex flex-col justify-center py-16 relative">
              <div className="w-[90%] max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 text-xs font-medium text-[#38d9d4] mb-4">
                    <span>Engineered for Mastery</span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                    Powerful Learning Capabilities Built for Speed
                  </h2>
                  <p className="mt-4 text-gray-400 text-sm sm:text-base leading-relaxed">
                    Designed from the ground up to help modern engineers transition into AI
                    specialization with deep architectural clarity.
                  </p>
                </div>

                {/* 3-Column Glassmorphism Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: "fi fi-br-brain",
                      title: "Autonomous Agent Maps",
                      desc: "Structured paths from LLM prompt engineering to LangGraph and multi-agent coordination.",
                    },
                    {
                      icon: "fi fi-br-layers",
                      title: "Deep Architecture Trees",
                      desc: "Milestone-oriented breakdowns of Transformer attention, KV-caching, and LoRA fine-tuning.",
                    },
                    {
                      icon: "fi fi-br-chart-network",
                      title: "Live Production Pipelines",
                      desc: "Hands-on guidance for deploying high-throughput inference endpoints with vLLM and TensorRT.",
                    },
                  ].map((feat, i) => (
                    <div
                      key={i}
                      className="group rounded-3xl p-8 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-2xl border border-white/10 hover:border-white/30 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#eb5722] to-[#38d9d4] flex items-center justify-center text-white text-xl mb-6 shadow-[0_0_20px_rgba(56,217,212,0.3)]">
                          <i className={feat.icon} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                      </div>
                      <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#38d9d4] group-hover:translate-x-1 transition-transform">
                        <span>Explore Module</span>
                        <i className="fi fi-br-angle-small-right text-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3: Engineered for Scale & Real-Time Performance
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="animated-section fixed inset-0 w-full h-full invisible">
        <div className="outer-wrap w-full h-full overflow-hidden">
          <div className="inner-wrap w-full h-full overflow-hidden">
            <div className="section-bg w-full h-full overflow-y-auto bg-[#050608] flex flex-col justify-center py-16 relative">
              <div className="w-[90%] max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 text-xs font-medium text-[#eb5722] mb-4">
                    <span>Continuous Milestone Progression</span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                    Zero Fluff. Verified Skills. Production Readiness.
                  </h2>
                  <p className="mt-5 text-gray-400 text-sm sm:text-base leading-relaxed">
                    Unlike static video courses, AiPather breaks complex systems into active
                    milestones with verifiable code checkpoints and cloud architectures.
                  </p>

                  <div className="mt-8 space-y-4">
                    {[
                      "Real-time benchmark comparisons across leading frontier models",
                      "Interactive system architectures for RAG & vector embedding pipelines",
                      "Hands-on checkpoints designed by senior AI engineers",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="w-5 h-5 rounded-full bg-[#38d9d4]/20 border border-[#38d9d4]/60 flex items-center justify-center text-[#38d9d4] shrink-0">
                          <i className="fi fi-br-check text-xs" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-tr from-white/[0.06] to-white/[0.02] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                  <div className="flex items-center justify-between pb-6 border-b border-white/10">
                    <span className="text-sm font-semibold text-white">Active Roadmap Stream</span>
                    <span className="text-xs text-[#38d9d4] font-mono">v3.4 Production</span>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                          01
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            LLM Fine-Tuning & Quantization
                          </div>
                          <div className="text-xs text-gray-400">4 Modules • 18 Checkpoints</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                        Active
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                          02
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            Multi-Agent Orchestration
                          </div>
                          <div className="text-xs text-gray-400">6 Modules • 24 Checkpoints</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
                        In Progress
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4: Glassmorphic CTA Banner & Comprehensive Footer (Final Stop)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="animated-section fixed inset-0 w-full h-full invisible">
        <div className="outer-wrap w-full h-full overflow-hidden">
          <div className="inner-wrap w-full h-full overflow-hidden">
            <div className="section-bg w-full h-full overflow-y-auto bg-[#050608] flex flex-col justify-between py-12 relative">
              {/* Glassmorphic Call To Action */}
              <div className="w-[90%] max-w-5xl mx-auto my-auto text-center py-12 sm:py-16 px-6 sm:px-12 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,0.9)] relative overflow-hidden">
                <div
                  className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, rgba(56,217,212,0.25), transparent 70%)",
                    filter: "blur(60px)",
                  }}
                />

                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight relative z-10">
                  Ready to Supercharge Your AI Engineering Journey?
                </h2>
                <p className="mt-4 text-gray-400 text-sm sm:text-base max-w-xl mx-auto relative z-10 leading-relaxed">
                  Join thousands of developers mastering high-impact AI skills with precision roadmaps
                  and verified milestone tracking.
                </p>

                <div className="mt-8 flex justify-center relative z-10">
                  <Link
                    href="#generate"
                    className="group relative rounded-full bg-white/[0.08] hover:bg-white/[0.16] backdrop-blur-2xl border border-white/20 hover:border-white/40 text-white font-medium text-sm sm:text-base px-8 py-3.5 flex items-center justify-center gap-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_3px_rgba(255,255,255,0.6)] transition-all duration-300 cursor-pointer"
                  >
                    <span className="leading-normal tracking-wide">Explore Roadmaps Now</span>
                    <span className="inline-flex items-center justify-center w-5 h-5 text-gray-300 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                      <i className="fi fi-br-angle-small-right text-lg sm:text-xl leading-none"></i>
                    </span>
                  </Link>
                </div>
              </div>

              {/* Complete Footer */}
              <div className="w-[90%] max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-white">AiPather</span>
                  <span>© {new Date().getFullYear()} All rights reserved.</span>
                </div>
                <div className="flex items-center gap-6 text-gray-400">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Privacy Policy
                  </span>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Terms of Service
                  </span>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Community Discord
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
