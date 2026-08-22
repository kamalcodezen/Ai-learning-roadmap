"use client";

import { useEffect, useState } from "react";
import {
  HiCheckCircle,
  HiAcademicCap,
  HiLightBulb,
  HiInformationCircle,
  HiBell,
  HiXMark,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import type { ToastProps, ToastVariant } from "./toast.types";

interface ToastComponentProps extends ToastProps {
  onClose: () => void;
}

interface VariantConfig {
  badgeBg: string;
  badgeText: string;
  iconColor: string;
  label: string;
  defaultTitle: string;
  Icon: IconType;
}

const variantConfigs: Record<ToastVariant, VariantConfig> = {
  success: {
    badgeBg: "bg-primary/20",
    badgeText: "text-foreground",
    iconColor: "text-primary",
    label: "Mastered",
    defaultTitle: "Great progress!",
    Icon: HiCheckCircle,
  },
  error: {
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-500 dark:text-rose-400",
    iconColor: "text-rose-500 dark:text-rose-400",
    label: "Ai Pather",
    defaultTitle: "Not quite, keep trying!",
    Icon: HiAcademicCap,
  },
  warning: {
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-600 dark:text-amber-400",
    iconColor: "text-amber-500 dark:text-amber-400",
    label: "Review",
    defaultTitle: "Quick reminder",
    Icon: HiLightBulb,
  },
  info: {
    badgeBg: "bg-sky-500/15",
    badgeText: "text-sky-600 dark:text-sky-400",
    iconColor: "text-sky-500 dark:text-sky-400",
    label: "Tip",
    defaultTitle: "Did you know?",
    Icon: HiInformationCircle,
  },
  default: {
    badgeBg: "bg-muted-foreground/15",
    badgeText: "text-foreground",
    iconColor: "text-primary",
    label: "Notice",
    defaultTitle: "Activity logged",
    Icon: HiBell,
  },
};

export default function LearningToast({
  variant = "default",
  message,
  duration = 4,
  onClose,
}: ToastComponentProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const enterFrame = requestAnimationFrame(() => setVisible(true));

    const startTime = Date.now();
    const durationMs = duration * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remaining);
    }, 16);

    const timeout = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(onClose, 300);
    }, durationMs);

    return () => {
      cancelAnimationFrame(enterFrame);
      clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [duration, onClose]);

  const config = variantConfigs[variant];
  const VariantIcon = config.Icon;

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(onClose, 300);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        pointer-events-auto relative overflow-hidden
        w-[340px] max-w-[calc(100vw-2rem)] rounded-xl
        bg-card/95 backdrop-blur-md
        border border-border shadow-[var(--shadow)]
        transition-all duration-300 ease-out
        ${
          visible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-2 opacity-0 scale-95 pointer-events-none"
        }
      `}
    >
      {/* Compact Content Area */}
      <div className="px-3.5 py-2.5 flex items-center gap-2.5">
        {/* Minimal Icon */}
        <VariantIcon className={`w-5 h-5 shrink-0 ${config.iconColor}`} />

        {/* Compact Label + Inline Message */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span
            className={`text-caption font-bold tracking-wider uppercase px-1.5 py-0.5 rounded ${config.badgeBg} ${config.badgeText} shrink-0`}
          >
            {config.label}
          </span>

          <p className="text-xs font-medium text-foreground truncate">
            {message || config.defaultTitle}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Dismiss notification"
          className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors shrink-0"
        >
          <HiXMark className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle Progress Bar */}
      <div className="w-full bg-muted/40 h-[2px]">
        <div
          className="h-full bg-primary transition-all duration-75 linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}