"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";

import brandLogo from "../../../../public/brand/AI-Pather-blue.png";

interface SidebarHeaderProps {
  onClose?: () => void;
}

export default function SidebarHeader({ onClose }: SidebarHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-2">
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2"
        aria-label="AI Pather home"
      >
        <span
          className="flex size-8 items-center justify-center rounded-full"
          style={{ backgroundColor: "#ceff1f" }}
        >
          <Image
            src={brandLogo}
            alt="Brand logo"
            className="ml-1 h-4 w-4"
            height={16}
            width={16}
          />
        </span>

        <span className="font-sans text-h4 font-semibold text-foreground">
          AI Pather
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <AnimatedThemeToggler className="hover:bg-foreground/10" />

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-8 items-center justify-center rounded-lg text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 lg:hidden"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
