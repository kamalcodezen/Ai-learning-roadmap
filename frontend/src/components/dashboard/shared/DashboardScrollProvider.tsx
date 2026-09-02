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
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <section
      ref={wrapperRef}
      aria-label="Dashboard content"
      className="relative min-h-0 w-full flex-1 overflow-y-auto pl-4 sm:pl-8 md:pl-12 lg:pl-[272px]"
    >
      <div ref={contentRef} className="global-pos relative w-full -ml-5 lg:ml-0 pt-20 lg:pt-5 p-5 lg:pl-2">
        {children}
      </div>
    </section>
  );
}
