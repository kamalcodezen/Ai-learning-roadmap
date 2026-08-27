"use client";

import { motion } from "motion/react";
import Link from "next/link";

import type { NavLink } from "../navigation";
import { cn } from "@/src/utils/cn";

interface SidebarNavItemProps {
  item: NavLink;
  active: boolean;
  indicatorId?: string;
  onClick?: () => void;
}

export default function SidebarNavItem({
  item,
  active,
  indicatorId,
  onClick,
}: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex w-full items-center gap-4 px-6 py-3.5 text-xs font-bold tracking-wider uppercase transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        active
          ? "sidebar-active-item"
          : "rounded-lg text-foreground/70 hover:bg-foreground/5 hover:text-primary"
      )}
    >
      {active && (
        <motion.span
          layoutId={indicatorId}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute inset-0 z-0 sidebar-active-item"
          aria-hidden="true"
        />
      )}

      <Icon
        aria-hidden="true"
        className={cn(
          "relative z-10 size-[18px] shrink-0",
          active &&
            "text-secondary dark:text-brand dark:drop-shadow-[0_0_8px_rgba(206,255,31,0.45)]",
        )}
      />
      <span className={cn("relative z-10 truncate", active && "text-secondary dark:text-foreground")}>
        {item.label}
      </span>
    </Link>
  );
}
