"use client";

import { useEffect, useState } from "react";
import BrandLoader from "@/src/components/shared/BrandLoader";

/**
 * PageReloadLoader
 * Displays the official BrandLoader on initial page load or full browser reload.
 * Fades out smoothly once hydration and assets are ready so the user gets a seamless,
 * flicker-free experience on the home banner or any reloaded page.
 */
export default function PageReloadLoader() {
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const handleComplete = () => {
      setFading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    };

    if (typeof document !== "undefined" && document.readyState === "complete") {
      const timer = setTimeout(handleComplete, 650);
      return () => clearTimeout(timer);
    } else {
      const onLoad = () => {
        setTimeout(handleComplete, 400);
      };
      window.addEventListener("load", onLoad);
      const fallbackTimer = setTimeout(handleComplete, 1200);

      return () => {
        window.removeEventListener("load", onLoad);
        clearTimeout(fallbackTimer);
      };
    }
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] transition-opacity duration-400 ease-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={fading}
    >
      <BrandLoader fullScreen />
    </div>
  );
}
