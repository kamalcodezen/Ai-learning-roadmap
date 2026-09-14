"use client";

import { useEffect, type ReactNode, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { authClient } from "@/src/lib/auth-client";
import { serverFetch } from "@/src/lib/core/server";

import BrandLoader from "@/src/components/shared/BrandLoader";

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

interface RoutingStateResponse {
  success: boolean;
  data: {
    onboardingCompleted: boolean;
    diagnosticCompleted: boolean;
  };
}

export default function SessionGuard({ children }: SessionGuardProps) {
  const sessionResult = authClient.useSession();
  const { data: session, isPending } = sessionResult;
  const router = useRouter();

  const activeUser = session?.user;
  const userRole = ((activeUser as { role?: string })?.role || "").toUpperCase();
  const isAdmin = userRole === "ADMIN";

  // Check onboarding & diagnostic routing state for non-admin learners
  const {
    data: routingState,
    isLoading: isRoutingLoading,
    isError: isRoutingError,
  } = useQuery({
    queryKey: ["routingState", activeUser?.id],
    queryFn: async () => {
      const res = (await serverFetch("/api/career-profile/routing-state")) as RoutingStateResponse;
      return res?.data;
    },
    enabled: !!activeUser && !isAdmin,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (isPending || activeUser) return;

    const timer = setTimeout(() => {
      router.replace("/signin");
    }, SESSION_GRACE_MS);

    return () => clearTimeout(timer);
  }, [isPending, activeUser, router]);

  // Enforce onboarding & diagnostic completion for non-admin users
  useEffect(() => {
    if (!activeUser || isAdmin || isRoutingLoading || isRoutingError || !routingState) return;

    if (!routingState.onboardingCompleted) {
      router.replace("/onboarding");
      return;
    }

    if (!routingState.diagnosticCompleted) {
      router.replace("/diagnostic");
      return;
    }
  }, [activeUser, isAdmin, isRoutingLoading, isRoutingError, routingState, router]);

  // Only show full-screen loading on initial fetch when we have no user data
  if (isPending && !activeUser) {
    return <BrandLoader message="Loading your dashboard…" />;
  }

  if (!activeUser) {
    // While redirecting to /signin
    return null;
  }

  // If learner and still verifying onboarding/diagnostic status
  if (!isAdmin && isRoutingLoading) {
    return <BrandLoader message="Verifying learning status…" />;
  }

  // If learner and onboarding/diagnostic is not completed, prevent flashing dashboard while redirecting
  if (!isAdmin && routingState && (!routingState.onboardingCompleted || !routingState.diagnosticCompleted)) {
    return (
      <BrandLoader
        message={
          !routingState.onboardingCompleted
            ? "Redirecting to Onboarding…"
            : "Redirecting to Diagnostic…"
        }
      />
    );
  }

  return (
    <DashboardSessionContext.Provider value={sessionResult}>
      {children}
    </DashboardSessionContext.Provider>
  );
}
