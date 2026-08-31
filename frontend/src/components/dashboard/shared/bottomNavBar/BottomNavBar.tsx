"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import type { NavLink } from "../navigation";
import { cn } from "@/src/utils/cn";
import brandLogo from "@/public/brand/AI-Pather-blue.png";

interface BottomNavBarProps {
  items: NavLink[];
}

export default function BottomNavBar({ items }: BottomNavBarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 lg:hidden"
    >
      <div
        className="flex items-center gap-1 rounded-full border px-2 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
        style={{
          backgroundColor: "#111621",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {/* Left brand icon */}
        <Link
          href="/"
          aria-label="AI Pather home"
          className="flex size-11 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <Image
            src={brandLogo}
            alt="Brand logo"
            className="ml-0.5 h-5 w-5 brightness-0 invert"
            height={20}
            width={20}
          />
        </Link>

        {/* Nav links */}
        <div className="relative flex flex-1 items-center justify-around">
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  active
                    ? "bg-background text-secondary dark:bg-transparent dark:text-white"
                    : "text-white/60 hover:text-white",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "relative z-10 size-5 transition-transform duration-300",
                    active && "scale-110",
                  )}
                />

                <span
                  className={cn(
                    "relative z-10 text-[10px] font-bold leading-tight transition-opacity duration-300",
                    active ? "opacity-100" : "opacity-70 group-hover:opacity-100",
                  )}
                >
                  {item.label}
                </span>

                {/* Animated active dot */}
                {active ? (
                  <motion.span
                    layoutId="bottom-nav-dot"
                    aria-hidden="true"
                    className="absolute -bottom-0.5 size-1 rounded-full bg-primary hidden dark:block"
                    transition={{ type: "spring", damping: 20, stiffness: 220 }}
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 size-1 rounded-full bg-transparent"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
