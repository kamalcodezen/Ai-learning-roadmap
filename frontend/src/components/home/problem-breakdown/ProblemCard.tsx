"use client";

import { ReactNode } from "react";

interface ProblemCardProps {
  number: string;
  title: string;
  description: string;
  children?: ReactNode;
  delay?: number;
}

export default function ProblemCard({
  number,
  title,
  description,
  children,
}: ProblemCardProps) {
  return (
    <article
      className="group relative flex flex-col justify-between overflow-hidden rounded-md border border-border bg-card-soft p-6 sm:p-8 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(206,255,49,0.08)]"
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="flex flex-col flex-1 space-y-6">
        <div className="space-y-3">
          <span className="text-sm font-semibold text-primary/70">{number}</span>
          <h3 className="font-sans text-2xl text-foreground tracking-tight">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Visual Slot */}
        <div className="mt-auto pt-6">
          {children}
        </div>
      </div>
    </article>
  );
}
