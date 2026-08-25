"use client";

import { ReactNode } from "react";

interface ProblemCardProps {
  number: string;
  title: string;
  description: string;
  children?: ReactNode;
  delay?: number;
  corner?: "top-right" | "bottom-left" | "top-left" | "bottom-right";
}

const cornerClasses = {
  "top-right": "top-0 right-0 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10",
  "bottom-left": "bottom-0 left-0 rounded-tr-full bg-gradient-to-tl from-primary/20 to-purple-500/10",
  "top-left": "top-0 left-0 rounded-br-full bg-gradient-to-bl from-primary/20 to-pink-500/10",
  "bottom-right": "bottom-0 right-0 rounded-tl-full bg-gradient-to-tr from-primary/20 to-indigo-500/10",
};

export default function ProblemCard({
  number,
  title,
  description,
  children,
  corner = "top-right",
}: ProblemCardProps) {
  return (
    <article
      className="group relative flex flex-col justify-between overflow-hidden rounded-md border border-border bg-card-soft p-6 sm:p-8 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(206,255,49,0.08)]"
    >
      {/* Corner gradient on hover */}
      <div className={`absolute w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${cornerClasses[corner]}`} />

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
