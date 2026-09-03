"use client";

import { ReactNode } from "react";

import { cn } from "@/src/utils/cn";
import { Card } from "@/src/components/ui/Card";

/** Shared gradient + corner-hover card style for learner dashboard "big" cards. */
export const glowCardClass =
  "group relative overflow-hidden rounded-md transition-all duration-300 border-2 border-background hover:border-brand shadow-none bg-[linear-gradient(to_bottom,#faf5ff_0%,#f3edff_45%,#ede5ff_100%)] dark:bg-[linear-gradient(to_bottom,#1a0e2e_0%,rgba(159,84,247,0.15)_100%)]";

/** Corner-hover glow shape placed inside a Card that already has the `group` class. */
export function CornerGlow({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10",
        className,
      )}
      aria-hidden="true"
    />
  );
}

/**
 * A "big"/content card with the shared glow gradient + mouseGlow + corner-hover.
 * Drop-in replacement for <Card> for the large content cards. The corner glow and
 * mouseGlow overlay sit behind content, which is wrapped in `relative z-10`.
 */
export function DashboardCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card mouseGlow className={cn(glowCardClass, className)}>
      <CornerGlow />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </Card>
  );
}