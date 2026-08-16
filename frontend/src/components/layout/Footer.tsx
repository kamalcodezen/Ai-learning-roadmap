"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/src/lib/utils";

// Register ScrollTrigger safely (SSR guard)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ---------------------------------------------------------------------------
// INLINE STYLES
// Uses theme-adaptive CSS tokens with glassmorphism and crisp typography.
// ---------------------------------------------------------------------------
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;

  --pill-bg-1:          rgba(255, 255, 255, 0.05);
  --pill-bg-2:          rgba(255, 255, 255, 0.01);
  --pill-shadow:        rgba(0, 0, 0, 0.7);
  --pill-highlight:     rgba(255, 255, 255, 0.15);
  --pill-inset-shadow:  rgba(0, 0, 0, 0.8);
  --pill-border:        rgba(255, 255, 255, 0.10);

  --pill-bg-1-hover:        rgba(255, 255, 255, 0.12);
  --pill-bg-2-hover:        rgba(255, 255, 255, 0.04);
  --pill-border-hover:      rgba(255, 255, 255, 0.30);
  --pill-shadow-hover:      rgba(0, 0, 0, 0.9);
  --pill-highlight-hover:   rgba(255, 255, 255, 0.35);
}

@keyframes footer-breathe {
  0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1.12); opacity: 0.9; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0);    }
  to   { transform: translateX(-50%); }
}

.animate-footer-breathe        { animation: footer-breathe        8s  ease-in-out infinite alternate; }
.animate-footer-scroll-marquee { animation: footer-scroll-marquee 40s linear      infinite; }

/* Grid background – visible top & bottom fade */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  mask-image:         linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

/* Aurora radial glow */
.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(235, 87, 34, 0.22) 0%,
    rgba(56, 217, 212, 0.16) 40%,
    transparent 70%
  );
}

/* Glass pill */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
    0 10px 30px -10px var(--pill-shadow),
    inset 0  1px 1px var(--pill-highlight),
    inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
    0 20px 40px -10px var(--pill-shadow-hover),
    inset 0 1px 1px var(--pill-highlight-hover);
  color: #ffffff;
}

/* Giant watermark text: pulled up with gradient fill from bottom to top */
.footer-giant-bg-text {
  font-size: 24vw;
  line-height: 0.8;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: transparent;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.04) 65%, transparent 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Heading styling: Clean, crisp, solid white typography with no glow/blur */
.footer-text-glow {
  color: #ffffff;
  text-shadow: none;
}
`;

// ---------------------------------------------------------------------------
// MAGNETIC BUTTON
// Wraps any element with a GSAP-powered magnetic hover effect.
// ---------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    /** Override the rendered element. Defaults to "button". */
    as?: React.ElementType;
  };

export const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const onMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(element, {
            x: x * 0.35,
            y: y * 0.35,
            rotationX: -y * 0.12,
            rotationY:  x * 0.12,
            scale: 1.04,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const onLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", onMove as EventListener);
        element.addEventListener("mouseleave", onLeave);
        return () => {
          element.removeEventListener("mousemove", onMove as EventListener);
          element.removeEventListener("mouseleave", onLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef)
            (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// ---------------------------------------------------------------------------
// CINEMATIC FOOTER
// ---------------------------------------------------------------------------

export interface CinematicFooterProps {
  /** Watermark text behind the heading. Defaults to "AIPATHER". */
  watermarkText?: string;
  /** Main CTA heading. Defaults to "Ready to begin?". */
  heading?: string;
  /** Copyright line. Defaults to "© 2026 AiPather. All rights reserved." */
  copyright?: string;
  /** Replace the primary action buttons entirely if needed. */
  primaryActions?: React.ReactNode;
  /** Replace the secondary pill links. */
  secondaryLinks?: React.ReactNode;
  /** Additional wrapper classes */
  className?: string;
}

// Single marquee segment – duplicated to create an infinite scroll effect.
function MarqueeSegment() {
  return (
    <div className="flex items-center space-x-12 px-6">
      <span>Master AI Roadmaps</span>
      <span className="text-[#eb5722]">✦</span>
      <span>Neural Architectures</span>
      <span className="text-[#38d9d4]">✦</span>
      <span>Autonomous Agents</span>
      <span className="text-[#eb5722]">✦</span>
      <span>MLOps Systems</span>
      <span className="text-[#38d9d4]">✦</span>
      <span>Transparent Milestones</span>
      <span className="text-[#eb5722]">✦</span>
      <span>Full-Stack AI Safety</span>
      <span className="text-[#38d9d4]">✦</span>
    </div>
  );
}

// Apple iOS icon
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.79 3.59-.76 1.56.04 2.87.67 3.55 1.76-3.13 1.77-2.62 5.92.35 7.14-.65 1.58-1.57 3.1-2.57 4.03zm-3.21-14.7c-.55 1.4-1.89 2.37-3.25 2.28.09-1.5 1.05-2.82 2.38-3.4 1.25-.57 2.66-.41 3.25.04-.15.35-.26.72-.38 1.08z" />
    </svg>
  );
}

// Android icon
function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0222 3.503C15.5902 8.242 13.8533 7.85 12 7.85c-1.8533 0-3.5902.392-5.1369 1.1004L4.841 5.4475a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3436-4.1021-2.6893-7.5743-6.1185-9.4396" />
    </svg>
  );
}

// Arrow-up icon
function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  );
}

export default function Footer({
  watermarkText = "AIPATHER",
  heading = "Ready to begin?",
  copyright = "© 2026 AiPather. All rights reserved.",
  primaryActions,
  secondaryLinks,
  className,
}: CinematicFooterProps) {
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLHeadingElement>(null);
  const linksRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) return;

    const ctx = gsap.context(() => {
      // Parallax watermark (snappy, smooth entrance starting early)
      gsap.fromTo(
        giantTextRef.current,
        { y: "6vh", scale: 0.94, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 95%",
            end: "bottom bottom",
            scrub: 0.3,
          },
        }
      );

      // Staggered reveal (starts as soon as footer enters viewport)
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 85%",
            end: "top 30%",
            scrub: 0.3,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Default primary actions (app-store buttons / platform buttons)
  const defaultPrimaryActions = (
    <div className="flex flex-wrap justify-center gap-4 w-full">
      <MagneticButton
        as="a"
        href="#roadmaps"
        aria-label="Explore AI Roadmaps"
        className="footer-glass-pill px-8 sm:px-10 py-4 sm:py-5 rounded-full text-white font-bold text-sm md:text-base flex items-center gap-3 group shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
      >
        <AppleIcon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
        Download iOS
      </MagneticButton>

      <MagneticButton
        as="a"
        href="#roadmaps"
        aria-label="Get it on Android"
        className="footer-glass-pill px-8 sm:px-10 py-4 sm:py-5 rounded-full text-white font-bold text-sm md:text-base flex items-center gap-3 group shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
      >
        <AndroidIcon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
        Download Android
      </MagneticButton>
    </div>
  );

  // Default secondary links
  const defaultSecondaryLinks = (
    <div className="flex flex-wrap justify-center gap-3 md:gap-6 w-full mt-2">
      {(["Privacy Policy", "Terms of Service", "Support", "Roadmaps", "API Docs"] as const).map((label) => (
        <MagneticButton
          key={label}
          as="a"
          href="#"
          className="footer-glass-pill px-6 py-3 rounded-full text-gray-400 font-medium text-xs md:text-sm hover:text-white"
        >
          {label}
        </MagneticButton>
      ))}
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/*
        Curtain-reveal wrapper:
        The clip-path constrains the fixed footer to only be visible
        while this element is in the viewport, creating a "scroll-reveal" curtain.
      */}
      <div
        ref={wrapperRef}
        className={cn("relative h-screen w-full", className)}
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-[#050608] text-white cinematic-footer-wrapper">

          {/* Ambient aurora glow */}
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />

          {/* Grid background */}
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          {/* Watermark text: Pulled up into position with bottom-to-top gradient */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute -bottom-[4vh] sm:-bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none"
          >
            {watermarkText}
          </div>

          {/* ── Marquee strip ── */}
          <div className="absolute top-24 sm:top-28 left-0 w-full overflow-hidden border-y border-white/10 bg-[#050608]/75 backdrop-blur-md py-3.5 sm:py-4 z-10 -rotate-2 scale-110 shadow-2xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-gray-400 uppercase">
              <MarqueeSegment />
              <MarqueeSegment />
            </div>
          </div>

          {/* ── Main CTA area (Enlarged heading, crisp text with no glow) ── */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-24 sm:mt-28 mb-10 sm:mb-14 w-full max-w-6xl mx-auto">
            <h2
              ref={headingRef}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black footer-text-glow tracking-tighter mb-8 sm:mb-10 text-center"
            >
              {heading}
            </h2>

            <div ref={linksRef} className="flex flex-col items-center gap-6 w-full">
              {primaryActions ?? defaultPrimaryActions}
              {secondaryLinks ?? defaultSecondaryLinks}
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="relative z-20 w-full pb-8 px-6 md:px-12 flex items-center justify-between gap-6">

            {/* Copyright */}
            <p className="text-gray-400 text-[10px] md:text-xs font-semibold tracking-widest uppercase">
              {copyright}
            </p>

            {/* Scroll-to-top */}
            <MagneticButton
              as="button"
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-gray-400 hover:text-white group"
            >
              <ArrowUpIcon className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300" />
            </MagneticButton>

          </div>
        </footer>
      </div>
    </>
  );
}
