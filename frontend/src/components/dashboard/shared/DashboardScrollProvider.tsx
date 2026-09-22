"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

interface DashboardScrollProviderProps {
  children: ReactNode;
}

export default function DashboardScrollProvider({ children }: DashboardScrollProviderProps) {
  const wrapperRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  // 1. Initialize Lenis ONLY on desktop screens (xl: >= 1280px)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (!wrapperRef.current || !contentRef.current) return;

    const isDesktop = () => window.innerWidth >= 1280;

    const initLenis = () => {
      if (!isDesktop()) {
        if (lenisRef.current) {
          lenisRef.current.destroy();
          lenisRef.current = null;
          delete (window as unknown as { __dashboardLenis?: Lenis }).__dashboardLenis;
        }
        return;
      }

      if (lenisRef.current) return; // Already running

      const lenis = new Lenis({
        wrapper: wrapperRef.current!,
        content: contentRef.current!,
        autoRaf: true,
        smoothWheel: true,
        lerp: 0.1,
        duration: 1.2,
        orientation: "vertical",
        gestureOrientation: "vertical",
      });

      lenisRef.current = lenis;
      (window as unknown as { __dashboardLenis?: Lenis }).__dashboardLenis = lenis;
    };

    initLenis();

    const handleResize = () => {
      if (!isDesktop()) {
        if (lenisRef.current) {
          lenisRef.current.destroy();
          lenisRef.current = null;
          delete (window as unknown as { __dashboardLenis?: Lenis }).__dashboardLenis;
        }
      } else {
        if (!lenisRef.current) {
          initLenis();
        } else {
          lenisRef.current.resize();
        }
      }
    };

    window.addEventListener("resize", handleResize);

    // Dynamic content observer for async-loaded cards/charts on desktop
    let resizeObserver: ResizeObserver | null = null;
    if (contentRef.current && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        lenisRef.current?.resize();
      });
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        delete (window as unknown as { __dashboardLenis?: Lenis }).__dashboardLenis;
      }
    };
  }, []);

  // 2. On route change, reset scroll to top immediately (handles both mobile window & desktop container)
  useEffect(() => {
    // Window scroll reset for mobile devices
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    // Inner container scroll reset for desktop
    if (wrapperRef.current) {
      wrapperRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" });
      wrapperRef.current.scrollTop = 0;
    }

    // Desktop Lenis instance reset
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      lenisRef.current.resize();
    }
  }, [pathname]);

  return (
    <section
      ref={wrapperRef}
      aria-label="Dashboard content"
      className="w-full xl:relative xl:min-h-0 xl:h-full xl:flex-1 xl:overflow-y-auto xl:pl-[265px]"
    >
      <div
        ref={contentRef}
        className="global-pos relative w-full pt-20 pb-28 px-3 sm:px-6 xl:pt-15 xl:pb-8 xl:pl-4 xl:pr-6"
      >
        {children}
      </div>
    </section>
  );
}
