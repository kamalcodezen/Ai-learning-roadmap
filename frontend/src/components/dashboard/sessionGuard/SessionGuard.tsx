"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useDirectSessionFetch, SessionProvider } from "../hooks/useSessionUser";

interface SessionGuardProps {
  children: ReactNode;
}

const SESSION_GRACE_MS = 3000;

export default function SessionGuard({ children }: SessionGuardProps) {
  const { user, isPending } = useDirectSessionFetch();
  const router = useRouter();

  useEffect(() => {
    if (isPending || user) return;

    const timer = setTimeout(() => {
      router.replace("/signin");
    }, SESSION_GRACE_MS);

    return () => clearTimeout(timer);
  }, [isPending, user, router]);

  if (isPending || !user) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen flex-col items-center justify-center gap-4 text-muted-foreground dark:bg-[#0b0f1a]"
      >
        <div className="jimu-primary-loading" />
        <span className="text-sm font-medium animate-pulse mt-20">Loading your dashboard…</span>
      </div>
    );
  }

  return (
    <SessionProvider value={{ user, isPending }}>
      {children}
    </SessionProvider>
  );
}
