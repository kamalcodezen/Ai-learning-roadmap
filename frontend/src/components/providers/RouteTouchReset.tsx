"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * RouteTouchReset
 * This component runs whenever the user navigates to a new page (pathname changes).
 * It ensures:
 * 1. Mobile touch scroll is never locked (clears document.body.style.overflow).
 * 2. Clicks are never blocked (clears document.body.style.pointerEvents).
 * 3. Mobile drawers and menus close automatically.
 */
export default function RouteTouchReset() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Reset body and html overflow so mobile can always scroll
    document.body.style.overflow = "";
    document.body.style.pointerEvents = "";
    document.documentElement.style.overflow = "";
    document.documentElement.style.pointerEvents = "";

    // Remove any leftover third-party scroll lock attributes
    document.body.removeAttribute("data-scroll-locked");
    document.documentElement.removeAttribute("data-scroll-locked");

    // Close any open drawers on route change
    window.dispatchEvent(new CustomEvent("route-change-close-drawers"));
  }, [pathname]);

  return null;
}
