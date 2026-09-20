"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import type { CSSProperties } from "react";
import { authClient } from "@/src/lib/auth-client";

const glareVars = {
  "--gh-angle": "-45deg",
  "--gh-size": "250%",
  "--gh-rgba": "rgba(255, 255, 255, 0.35)",
} as CSSProperties;

export default function CrownButton() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;

  const plan =
    (session?.user as { plan?: string } | undefined)?.plan?.toUpperCase() || "FREE";

  if (plan !== "FREE") return null;

  return (
    <Link
      href="/pricing"
      aria-label="Go to pricing"
      className="relative flex ml-1.5 size-9 md:size-10 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-[0_0_16px_rgba(159,84,247,0.4)] transition-transform duration-300 hover:scale-105"
      style={{ background: "var(--gradient-primary)", ...glareVars }}
    >
      <Crown className="size-5 md:size-6 text-white" strokeWidth={2} />
      <span className="crown-glare pointer-events-none absolute inset-0 z-10 bg-no-repeat" />
    </Link>
  );
}