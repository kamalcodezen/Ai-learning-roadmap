"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const SINGLE_LINE_TEXT =
  "Test your learning ability with patience - AI roadmaps, deep neural architectures, and scalable systems.";

export default function SiteLoader({ onComplete }: { onComplete?: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const currentScrollRef = useRef(0);
  const maxScrollRef = useRef(1000);
  const isTriggeredRef = useRef(false);

  useEffect(() => {
    if (!textRef.current || !trackRef.current) return;

    // Calculate how far the text needs to travel so the user reads from start to the very end
    const calculateMaxScroll = () => {
      if (!textRef.current || !trackRef.current) return;
      const textWidth = textRef.current.scrollWidth;
      const windowWidth = window.innerWidth;
      // Distance needed to scroll from start (left padding) to end of text
      const totalDistance = Math.max(textWidth - windowWidth + windowWidth * 0.4, 600);
      maxScrollRef.current = totalDistance;
    };

    // Lock background page scroll strictly so the page cannot scroll beneath the loader
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    calculateMaxScroll();
    window.addEventListener("resize", calculateMaxScroll);

    // Initial position: Start still at initial padding
    gsap.set(textRef.current, { x: 0 });

    const pullUpExit = () => {
      if (isTriggeredRef.current || !containerRef.current) return;
      isTriggeredRef.current = true;

      // Ensure viewport is pinned to top BannerSection
      window.scrollTo(0, 0);

      // Fish stinger snap pull-up animation: quick pre-tension dip then instant upward snap
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          document.documentElement.style.overflow = "";
          window.scrollTo(0, 0);
          setIsVisible(false);
          onComplete?.();
        },
      });

      tl.to(containerRef.current, {
        y: 25,
        duration: 0.18,
        ease: "power2.out",
      }).to(containerRef.current, {
        yPercent: -110,
        duration: 0.9,
        ease: "expo.inOut",
      });
    };

    // Wheel and Touch Event Listener
    const handleWheel = (e: WheelEvent) => {
      if (isTriggeredRef.current) return;
      e.preventDefault();
      e.stopPropagation();

      // Delta sensitivity
      const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      currentScrollRef.current = Math.max(
        0,
        Math.min(currentScrollRef.current + delta * 1.2, maxScrollRef.current),
      );

      const progress = Math.min(
        1,
        currentScrollRef.current / (maxScrollRef.current * 0.95),
      );
      setScrollProgress(progress);

      // Smoothly slide text based strictly on scroll amount
      if (textRef.current) {
        gsap.to(textRef.current, {
          x: -currentScrollRef.current,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      // Check if reached end of line (>= 96% of scroll distance)
      if (currentScrollRef.current >= maxScrollRef.current * 0.95) {
        pullUpExit();
      }
    };

    // Touch support
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isTriggeredRef.current) return;
      e.preventDefault();
      e.stopPropagation();

      const touchY = e.touches[0].clientY;
      const delta = (touchStartY - touchY) * 1.8;
      touchStartY = touchY;

      currentScrollRef.current = Math.max(
        0,
        Math.min(currentScrollRef.current + delta, maxScrollRef.current),
      );

      const progress = Math.min(
        1,
        currentScrollRef.current / (maxScrollRef.current * 0.95),
      );
      setScrollProgress(progress);

      if (textRef.current) {
        gsap.to(textRef.current, {
          x: -currentScrollRef.current,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      if (currentScrollRef.current >= maxScrollRef.current * 0.95) {
        pullUpExit();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      container.addEventListener("touchstart", handleTouchStart, { passive: true });
      container.addEventListener("touchmove", handleTouchMove, { passive: false });
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.removeEventListener("resize", calculateMaxScroll);
      if (container) {
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [onComplete]);

  const handleManualSkip = () => {
    if (isTriggeredRef.current || !containerRef.current) return;
    isTriggeredRef.current = true;

    window.scrollTo(0, 0);

    gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        window.scrollTo(0, 0);
        setIsVisible(false);
        onComplete?.();
      },
    })
      .to(containerRef.current, {
        y: 20,
        duration: 0.15,
        ease: "power2.out",
      })
      .to(containerRef.current, {
        yPercent: -110,
        duration: 0.85,
        ease: "expo.inOut",
      });
  };

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050608] text-white select-none overflow-hidden will-change-transform"
      style={{
        boxShadow: "0 30px 100px rgba(0,0,0,0.9)",
      }}
    >
      {/* ── Ambient Radial Glows in Glassmorphism ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1100px] h-[700px] sm:h-[1100px] pointer-events-none rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(235,87,34,0.18) 0%, rgba(56,217,212,0.12) 45%, transparent 70%)",
          filter: "blur(110px)",
        }}
      />

      {/* ── Single Line Still Headline that Reacts strictly to Mouse Scroll ── */}
      <main
        ref={trackRef}
        className="relative z-10 w-full overflow-hidden flex items-center py-12 sm:py-20"
      >
        <div className="w-full px-8 sm:px-16 flex items-center">
          <h1
            ref={textRef}
            className="shrink-0 whitespace-nowrap text-5xl sm:text-7xl md:text-8xl lg:text-[100px] xl:text-[116px] font-black tracking-tight text-white drop-shadow-[0_12px_40px_rgba(0,0,0,0.9)] will-change-transform leading-tight cursor-default"
          >
            {SINGLE_LINE_TEXT}
          </h1>
        </div>
      </main>
    </div>
  );
}
