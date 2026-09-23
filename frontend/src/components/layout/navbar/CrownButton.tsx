"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import type { CSSProperties } from "react";
import { authClient } from "@/src/lib/auth-client";
import { cn } from "@/src/utils/cn";
import { useIsMounted } from "@/src/hooks/useIsMounted";

const glareVars = {
  "--gh-angle": "-45deg",
  "--gh-size": "250%",
  "--gh-rgba": "rgba(255, 255, 255, 0.45)",
} as CSSProperties;

interface CrownButtonProps {
  className?: string;
}

export default function CrownButton({ className }: CrownButtonProps) {
  const mounted = useIsMounted();
  const { data: session } = authClient.useSession();

  const user = mounted ? (session?.user as { role?: string; plan?: string } | undefined) : undefined;
  const userRole = (user?.role || "").toUpperCase();
  const userPlan = (user?.plan || "FREE").toUpperCase();
  const isAdmin = userRole === "ADMIN";

  // Dynamic crown styling & glow based on active plan / role
  const getCrownStyle = () => {
    if (isAdmin) {
      return {
        background: "linear-gradient(135deg, #9333ea 0%, #c084fc 50%, #ec4899 100%)",
        shadow: "shadow-[0_0_18px_rgba(168,85,247,0.65)]",
        title: "Super Admin Access",
      };
    }
    if (userPlan === "PRO") {
      return {
        background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)",
        shadow: "shadow-[0_0_18px_rgba(245,158,11,0.65)]",
        title: "Pro Tier Active",
      };
    }
    if (userPlan === "PLUS") {
      return {
        background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #a855f7 100%)",
        shadow: "shadow-[0_0_18px_rgba(124,58,237,0.6)]",
        title: "Plus Tier Active",
      };
    }
    // FREE / Guest
    return {
      background: "var(--gradient-primary)",
      shadow: "shadow-[0_0_16px_rgba(159,84,247,0.4)]",
      title: "Free Tier - Upgrade Plan",
    };
  };

  const styleConfig = getCrownStyle();

  return (
    <Link
      href="/pricing"
      aria-label="Go to pricing"
      title={styleConfig.title}
      className={cn(
        "relative flex size-9 md:size-10 shrink-0 items-center justify-center overflow-hidden rounded-full transition-transform duration-300 hover:scale-105 active:scale-95",
        styleConfig.shadow,
        className
      )}
      style={{ background: styleConfig.background, ...glareVars }}
    >
      <Crown className="size-6  text-white drop-shadow-xs" strokeWidth={2.2} />
      <span className="crown-glare pointer-events-none absolute inset-0 z-10 bg-no-repeat" />
    </Link>
  );
}