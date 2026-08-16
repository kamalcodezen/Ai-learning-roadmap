"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import BannerSection from "@/src/components/shared/BannerSection";
import BrandPartners from "@/src/components/shared/BrandPartners";
import DiagonalMarqueeSection from "@/src/components/shared/DiagonalMarqueeSection";
import Footer from "@/src/components/layout/Footer";

export default function ContinuousAnimatedSections({
  isLoaderActive,
}: {
  isLoaderActive: boolean;
}) {
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animatingRef = useRef(false);
  const currentIndexRef = useRef(-1);
  const totalSectionsCount = 3; // Section 0: Banner, Section 1: Roadmaps, Section 2: Footer

  const gotoSection = useCallback((index: number, direction?: number) => {
    if (!containerRef.current) return;

    const sections = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-panel"),
    );
    const outerWrappers = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-panel .outer"),
    );
    const innerWrappers = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-panel .inner"),
    );
    const bgElements = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-panel .bg"),
    );

    if (!sections.length) return;

    // Strict boundary: stop at Section 0 and stop at final Footer section (no loop)
    if (index < 0 || index >= sections.length) return;
    if (animatingRef.current && currentIndexRef.current === index) return;

    animatingRef.current = true;

    const prevIndex = currentIndexRef.current;
    const dir =
      direction !== undefined
        ? direction
        : index > prevIndex
        ? 1
        : -1;
    const fromTop = dir === -1;
    const dFactor = fromTop ? -1 : 1;

    const targetBg = bgElements[index];
    if (targetBg) {
      if (fromTop) {
        // When coming from below, start at the bottom of the section
        targetBg.scrollTop = targetBg.scrollHeight;
      } else {
        // When coming from above, start at the top of the section
        targetBg.scrollTop = 0;
      }
    }

    const tl = gsap.timeline({
      defaults: { duration: 1.15, ease: "power2.inOut" },
      onComplete: () => {
        animatingRef.current = false;
      },
    });

    if (prevIndex >= 0 && prevIndex !== index) {
      gsap.set(sections[prevIndex], { zIndex: 0 });
      tl.to(bgElements[prevIndex], { yPercent: -12 * dFactor }).set(
        sections[prevIndex],
        { autoAlpha: 0 },
      );
    }

    gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
    tl.fromTo(
      [outerWrappers[index], innerWrappers[index]],
      {
        yPercent: (i: number) => (i ? -100 * dFactor : 100 * dFactor),
      },
      {
        yPercent: 0,
      },
      0,
    ).fromTo(bgElements[index], { yPercent: 12 * dFactor }, { yPercent: 0 }, 0);

    currentIndexRef.current = index;
    setCurrentSection(index);
  }, []);

  useEffect(() => {
    if (isLoaderActive || !containerRef.current) return;

    const sections = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-panel"),
    );
    const outerWrappers = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-panel .outer"),
    );
    const innerWrappers = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-panel .inner"),
    );
    const bgElements = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll(".animated-panel .bg"),
    );

    if (!sections.length) return;

    // Initialize all panels
    gsap.set(sections, { autoAlpha: 0, zIndex: 0 });
    gsap.set(outerWrappers, { yPercent: 100 });
    gsap.set(innerWrappers, { yPercent: -100 });

    // Wheel listener: wait until current section reaches finish line before triggering swipe
    let scrollAccumulator = 0;
    let accumulatorTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

    const handleWheel = (e: WheelEvent) => {
      if (animatingRef.current || !containerRef.current) return;

      const activeBg = bgElements[currentIndexRef.current];
      if (!activeBg) return;

      const isScrollable = activeBg.scrollHeight > activeBg.clientHeight + 15;
      const isAtBottom = isScrollable
        ? activeBg.scrollTop + activeBg.clientHeight >= activeBg.scrollHeight - 25
        : true;
      const isAtTop = isScrollable ? activeBg.scrollTop <= 15 : true;

      if (e.deltaY > 0) {
        // Scrolling Down
        if (isAtBottom) {
          scrollAccumulator += e.deltaY;
          clearTimeout(accumulatorTimeout);
          accumulatorTimeout = setTimeout(() => {
            scrollAccumulator = 0;
          }, 300);

          // Once finish line is reached and user scrolls down further (threshold of 80px)
          if (scrollAccumulator > 80 && currentIndexRef.current < totalSectionsCount - 1) {
            e.preventDefault();
            scrollAccumulator = 0;
            gotoSection(currentIndexRef.current + 1, 1);
          }
        }
      } else if (e.deltaY < 0) {
        // Scrolling Up
        if (isAtTop) {
          scrollAccumulator += Math.abs(e.deltaY);
          clearTimeout(accumulatorTimeout);
          accumulatorTimeout = setTimeout(() => {
            scrollAccumulator = 0;
          }, 300);

          // Once top boundary is reached and user scrolls up further
          if (scrollAccumulator > 80 && currentIndexRef.current > 0) {
            e.preventDefault();
            scrollAccumulator = 0;
            gotoSection(currentIndexRef.current - 1, -1);
          }
        }
      }
    };

    // Touch support
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (animatingRef.current || !containerRef.current) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;

      const activeBg = bgElements[currentIndexRef.current];
      if (!activeBg) return;

      const isScrollable = activeBg.scrollHeight > activeBg.clientHeight + 15;
      const isAtBottom = isScrollable
        ? activeBg.scrollTop + activeBg.clientHeight >= activeBg.scrollHeight - 25
        : true;
      const isAtTop = isScrollable ? activeBg.scrollTop <= 15 : true;

      if (diffY > 60 && isAtBottom) {
        if (currentIndexRef.current < totalSectionsCount - 1) {
          gotoSection(currentIndexRef.current + 1, 1);
        }
      } else if (diffY < -60 && isAtTop) {
        if (currentIndexRef.current > 0) {
          gotoSection(currentIndexRef.current - 1, -1);
        }
      }
    };

    // Keyboard support
    const handleKeyDown = (e: KeyboardEvent) => {
      if (animatingRef.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (currentIndexRef.current < sections.length - 1) {
          gotoSection(currentIndexRef.current + 1, 1);
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (currentIndexRef.current > 0) {
          gotoSection(currentIndexRef.current - 1, -1);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    // Initial show Section 0 (Banner)
    gotoSection(0, 1);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoaderActive, gotoSection]);

  const scrollToTop = () => {
    if (animatingRef.current || currentSection === 0) return;
    gotoSection(0, -1);
  };

  // Circular progress math
  const progressRatio = totalSectionsCount > 1 ? currentSection / (totalSectionsCount - 1) : 0;
  const circleRadius = 22;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden bg-[#050608]">
      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 0: Banner Section + Endless 3D Concave Carousel
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="animated-panel fixed inset-0 w-full h-full invisible">
        <div className="outer w-full h-full overflow-hidden">
          <div className="inner w-full h-full overflow-hidden">
            <div className="bg w-full h-full flex flex-col justify-center pt-20 pb-8 overflow-y-auto bg-[#050608] relative">
              <BannerSection />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1: Brand Partners & Diagonal Infinite Marquee (95% Container)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="animated-panel fixed inset-0 w-full h-full invisible">
        <div className="outer w-full h-full overflow-hidden">
          <div className="inner w-full h-full overflow-hidden">
            <div className="bg w-full h-full flex flex-col justify-center items-center py-12 overflow-y-auto bg-[#050608] relative">
              <div className="w-[95%] mx-auto rounded-[30px] overflow-hidden border border-white/5 bg-[#07080c] shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative my-auto">
                <BrandPartners />
                <DiagonalMarqueeSection />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2: Natural Footer (Final Stop)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="animated-panel fixed inset-0 w-full h-full invisible">
        <div className="outer w-full h-full overflow-hidden">
          <div className="inner w-full h-full overflow-hidden">
            <div className="bg w-full h-full flex flex-col justify-end overflow-y-auto bg-[#050608] relative">
              <Footer />
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating Circular Scroll-to-Top Button with Glowing Progress Ring ── */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#0d0e13]/85 hover:bg-[#161822] backdrop-blur-2xl border border-white/15 hover:border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.3)] transition-all duration-500 cursor-pointer group focus:outline-none ${
          currentSection > 0
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-6 pointer-events-none"
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
    </div>
  );
}
