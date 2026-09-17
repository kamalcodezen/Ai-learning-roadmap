"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Lock } from "lucide-react";

import type { NavLink } from "../navigation";
import { cn } from "@/src/utils/cn";
import { useDashboardSession } from "../sessionGuard/SessionGuard";

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
  const { data: session } = useDashboardSession();
  const user = session?.user as { role?: string; plan?: string } | undefined;
  const userRole = (user?.role || "LEARNER").toUpperCase();
  const userPlan = (user?.plan || "FREE").toUpperCase();
  const isAdmin = userRole === "ADMIN";

  // Check if feature is locked for current user's plan
  const isLocked = Boolean(
    !isAdmin &&
      item.requiredPlan &&
      ((item.requiredPlan === "PLUS" && userPlan === "FREE") ||
        (item.requiredPlan === "PRO" && userPlan !== "PRO"))
  );

  const handleClick = () => {
    onClick?.();
  };

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex w-full items-center gap-3 px-6 py-3.5 text-xs font-bold tracking-wider uppercase transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
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
            "text-secondary dark:text-brand dark:drop-shadow-[0_0_8px_rgba(206,255,31,0.45)]"
        )}
      />
      <span
        className={cn(
          "relative z-10 truncate",
          active && "text-secondary dark:text-foreground"
        )}
      >
        {item.label}
      </span>

      {/* Lock badge for restricted tier items */}
      {isLocked && (
        <span className="ml-auto relative z-10 flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-primary border border-primary/25">
          <Lock className="size-2.5" />
          {item.requiredPlan}
        </span>
      )}
    </Link>
  );
}
