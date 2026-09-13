"use client";

import { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/src/utils/cn";

type DashboardButtonSize = "sm" | "md" | "lg";

export interface DashboardButtonProps {
  text: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  size?: DashboardButtonSize;
  radius?: "md" | "lg" | "xl";
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  icon?: ReactNode;
}

const sizeClass: Record<DashboardButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-sm",
};

const radiusClass: Record<NonNullable<DashboardButtonProps["radius"]>, string> = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
};

export default function DashboardButton({
  text,
  href,
  onClick,
  type = "button",
  size = "md",
  radius = "lg",
  disabled = false,
  fullWidth = false,
  className,
  icon,
}: DashboardButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 bg-primary text-white font-medium transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed",
    sizeClass[size],
    radiusClass[radius],
    fullWidth && "w-full",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {icon}
        {text}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {icon}
      {text}
    </button>
  );
}