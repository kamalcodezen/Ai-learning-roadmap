import type { ReactNode } from "react";

export type StatusBadgeTone =
  "primary" | "green" | "orange" | "red" | "blue" | "purple" | "gray";

const tones: Record<StatusBadgeTone, string> = {
  primary: "bg-primary/10 text-primary",
  green: "bg-green-500/10 text-green-500",
  orange: "bg-orange-500/10 text-orange-500",
  red: "bg-red-500/10 text-red-500",
  blue: "bg-blue-500/10 text-blue-500",
  purple: "bg-purple-500/10 text-purple-500",
  gray: "bg-gray-500/10 text-gray-500",
};

export default function StatusBadge({
  tone = "primary",
  icon,
  children,
  className = "",
}: {
  tone?: StatusBadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
