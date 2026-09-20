"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";
import NotificationBell from "../notifications/NotificationBell";

interface SidebarHeaderProps {
  onClose?: () => void;
}

export default function SidebarHeader({ onClose }: SidebarHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border pl-4 pr-3 py-3">
      <Link
        href="/"
        className="flex shrink-0 items-center"
        aria-label="AI Pather home"
      >
        <Image
          src="/brand/AI-Pather-blue.png"
          alt="AI Pather"
          width={140}
          height={26}
          className="h-6 md:h-7 w-auto block dark:hidden object-contain"
          priority
        />
        <Image
          src="/brand/AI-Pather-white.png"
          alt="AI Pather"
          width={140}
          height={26}
          className="h-6 md:h-7 w-auto hidden dark:block object-contain"
          priority
        />
      </Link>

      <div className="hidden lg:flex items-center ml-auto">
        <NotificationBell />
        <AnimatedThemeToggler className="hover:bg-foreground/10" />
      </div>

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
  );
}
