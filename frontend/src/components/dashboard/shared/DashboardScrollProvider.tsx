"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";

interface DashboardScrollProviderProps {
  children: ReactNode;
}

export default function DashboardScrollProvider({ children }: DashboardScrollProviderProps) {
  const wrapperRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (!wrapperRef.current || !contentRef.current) return;

    const lenis = new Lenis({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      autoRaf: true,
      smoothWheel: true,
      lerp: 0.1,
      duration: 1.2,
      orientation: "vertical",
      gestureOrientation: "vertical",
    });

    (window as unknown as { __dashboardLenis?: Lenis }).__dashboardLenis = lenis;

    const handleResize = () => {
      lenis.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      delete (window as unknown as { __dashboardLenis?: Lenis }).__dashboardLenis;
      lenis.destroy();
    };
  }, []);

  return (
    <section
      ref={wrapperRef}
      aria-label="Dashboard content"
      className="relative min-h-0 w-full flex-1 overflow-y-auto md:pl-0 lg:pl-[265px]"
    >
      <div ref={contentRef} className="global-pos relative w-full ml-0 lg:ml-0 pt-17 pb-24 lg:pt-15 lg:pb-8 p-3 lg:pl-4 lg:pr-6">
        {children}
      </div>
    </section>
  );
}
