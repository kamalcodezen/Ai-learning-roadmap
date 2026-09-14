"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardSession } from "./sessionGuard/SessionGuard";
import { showToast } from "@/src/components/ui/toast";
import BrandLoader from "@/src/components/shared/BrandLoader";

/**
 * ============================================================
 * PLAN GUARD COMPONENT
 * ============================================================
 * Wraps paid pages and enforces tier access:
 * 1. Checks the user's active plan.
 * 2. If locked, shows an informative toast and redirects to /#pricing.
 * 3. Admins and paid tier users are granted full access.
 * ============================================================
 */
interface PlanGuardProps {
  requiredPlan: "PLUS" | "PRO";
  children: React.ReactNode;
}

export default function PlanGuard({ requiredPlan, children }: PlanGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = useDashboardSession();

  const user = session?.user as { role?: string; plan?: string } | undefined;
  const userRole = (user?.role || "LEARNER").toUpperCase();
  const userPlan = (user?.plan || "FREE").toUpperCase();
  const isAdmin = userRole === "ADMIN";

  // Check if current user is allowed access
  const isLocked = Boolean(
    !isAdmin &&
      ((requiredPlan === "PLUS" && userPlan === "FREE") ||
        (requiredPlan === "PRO" && userPlan !== "PRO"))
  );

  useEffect(() => {
    if (!isPending && isLocked) {
      showToast({
        message: `AI Pather ${requiredPlan} plan is required to access this feature.`,
        variant: "info",
      });
      router.replace("/#pricing");
    }
  }, [isPending, isLocked, requiredPlan, router]);

  if (isPending || isLocked) {
    return <BrandLoader message="Verifying subscription access…" />;
  }

  return <>{children}</>;
}
