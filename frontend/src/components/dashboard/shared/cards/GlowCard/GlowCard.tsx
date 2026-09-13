import { ReactNode } from "react";
import { useTheme } from "next-themes";
import { BorderBeam } from "@/src/components/ui/border-beam";
import { cn } from "@/src/utils/cn";
import "./glowCard.css";

const cornerClasses = {
  "top-right":
    "top-0 right-0 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10",
  "bottom-left":
    "bottom-0 left-0 rounded-tr-full bg-gradient-to-tl from-primary/20 to-purple-500/10",
  "top-left":
    "top-0 left-0 rounded-br-full bg-gradient-to-bl from-primary/20 to-pink-500/10",
  "bottom-right":
    "bottom-0 right-0 rounded-tl-full bg-gradient-to-tr from-primary/20 to-indigo-500/10",
};

export interface GlowCardProps {
  children: ReactNode;
  className?: string;
  corner?: keyof typeof cornerClasses;
  href?: string;
}

/**
 * Shared glow card — gradient background, corner shape, background glow and
 * animated border beam. Used for KPI/stat tiles across both dashboards.
 */
export function GlowCard({
  children,
  className = "",
  corner,
  href,
}: GlowCardProps) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const colorFrom = dark ? "#B978FF" : "#9F54F7";
  const colorTo = dark ? "#A855F7" : "#8523F5";

  const inner = (
    <>
      {corner && (
        <div
          className={cn(
            "pointer-events-none absolute w-28 h-28",
            cornerClasses[corner],
          )}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <BorderBeam
          size={60}
          duration={4}
          colorFrom={colorFrom}
          colorTo={colorTo}
        />
      </div>
      <div className="relative">{children}</div>
    </>
  );

  const baseClass =
    "glow-card group relative flex flex-col justify-between overflow-hidden rounded-lg border border-border p-5 sm:p-6 transition-all";

  if (href) {
    return (
      <a href={href} className={`${baseClass} ${className}`}>
        {inner}
      </a>
    );
  }

  return <div className={`${baseClass} ${className}`}>{inner}</div>;
}
