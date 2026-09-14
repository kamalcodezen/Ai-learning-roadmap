"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import { serverFetch } from "@/src/lib/core/server";
import { Spinner } from "@heroui/react";

interface RoutingStateResponse {
  success: boolean;
  data: {
    onboardingCompleted: boolean;
    diagnosticCompleted: boolean;
  };
}

export default function AuthSuccessPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        const userRole = ((session.user as { role?: string }).role || "learner").toUpperCase();

        if (userRole === "ADMIN") {
          router.replace("/dashboard/admin/dashboard");
          return;
        }

        serverFetch("/api/career-profile/routing-state")
          .then((res) => {
            const data = (res as RoutingStateResponse)?.data;
            if (data) {
              if (!data.onboardingCompleted) {
                router.replace("/onboarding");
                return;
              }
              if (!data.diagnosticCompleted) {
                router.replace("/diagnostic");
                return;
              }
            }
            router.replace("/dashboard/learner");
          })
          .catch(() => {
            router.replace("/onboarding");
          });
      } else {
        router.replace("/signin");
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground animate-pulse">Completing sign in...</p>
      </div>
    </div>
  );
}
