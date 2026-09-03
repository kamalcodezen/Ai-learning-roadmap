"use client";

import { useEffect, useState, type ReactNode, createContext, useContext } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/src/lib/auth-client";

interface SessionGuardProps {
  children: ReactNode;
}

const SESSION_GRACE_MS = 3000;

type SessionContextType = ReturnType<typeof authClient.useSession>;
const DashboardSessionContext = createContext<SessionContextType | null>(null);

export const useDashboardSession = () => {
  const context = useContext(DashboardSessionContext);
  if (!context) {
    throw new Error("useDashboardSession must be used within a SessionGuard");
  }
  return context;
};

export default function SessionGuard({ children }: SessionGuardProps) {
  const sessionResult = authClient.useSession();
  const { data: session, isPending } = sessionResult;
  const router = useRouter();
  const [cachedUser, setCachedUser] = useState(session?.user);

  useEffect(() => {
    if (session?.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCachedUser(session.user);
    }
  }, [session?.user]);

  const activeUser = session?.user || cachedUser;

  useEffect(() => {
    if (isPending || activeUser) return;

    const timer = setTimeout(() => {
      router.replace("/signin");
    }, SESSION_GRACE_MS);

    return () => clearTimeout(timer);
  }, [isPending, activeUser, router]);

  // Only show full-screen loading on initial fetch when we have no user data
  if (isPending && !activeUser) {
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

  if (!activeUser) {
    // While redirecting, show nothing or loading to prevent flashing protected content
    return null;
  }

  return (
    <DashboardSessionContext.Provider value={sessionResult}>
      {children}
    </DashboardSessionContext.Provider>
  );
}
