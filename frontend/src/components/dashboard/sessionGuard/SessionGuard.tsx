"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useSessionUser } from "../hooks/useSessionUser";

interface SessionGuardProps {
  children: ReactNode;
}

const SESSION_GRACE_MS = 3000;

export default function SessionGuard({ children }: SessionGuardProps) {
  const { user, isPending } = useSessionUser();
  const router = useRouter();

  useEffect(() => {
    if (isPending || user) return;

    const timer = setTimeout(() => {
      router.replace("/");
    }, SESSION_GRACE_MS);

    return () => clearTimeout(timer);
  }, [isPending, user, router]);

  if (isPending || !user) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen items-center justify-center gap-3 text-muted-foreground dark:bg-[#0b0f19]"
      >
        <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
        <span className="text-sm">Loading your dashboard…</span>
      </div>
    );
  }

  return <>{children}</>;
}
