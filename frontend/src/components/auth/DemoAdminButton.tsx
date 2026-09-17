"use client";

import { useState } from "react";
import { ShieldCheck, Loader2, Sparkles } from "lucide-react";
import { showToast } from "@/src/components/ui/toast";
import { authClient } from "@/src/lib/auth-client";

/**
 * ============================================================
 * TEMPORARY DEMO ADMIN LOGIN BUTTON
 * ============================================================
 * Purpose: Allows 1-click instant login as Admin for teacher / review demos.
 * Fully responsive for mobile (320px+), tablets, and desktops.
 * 
 * How to remove later:
 * 1. Delete this file (`DemoAdminButton.tsx`)
 * 2. Delete the API route (`src/app/api/auth/demo-admin/route.ts`)
 * 3. Remove `<DemoAdminButton />` from `src/components/auth/AuthForm.tsx`
 * ============================================================
 */
export default function DemoAdminButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoAdminLogin = async () => {
    try {
      setIsLoading(true);

      // Step 1: Ensure demo admin account is seeded and updated in DB
      try {
        await fetch("/api/auth/demo-admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (prepError) {
        console.warn("[Demo Admin Prep Note]", prepError);
      }

      // Step 2: Native Better-Auth Client sign-in with full signed cookie creation
      const { error } = await authClient.signIn.email({
        email: "admin@aipather.com",
        password: "AdminPassword123!",
      });

      if (error) {
        // If first attempt failed, re-run preparation and retry once
        await fetch("/api/auth/demo-admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const retry = await authClient.signIn.email({
          email: "admin@aipather.com",
          password: "AdminPassword123!",
        });

        if (retry.error) {
          throw new Error(retry.error.message || "Failed to log in as demo admin");
        }
      }

      showToast({
        variant: "success",
        message: "Logged in as Demo Admin! Redirecting...",
        duration: 3,
      });

      // Step 3: Hard redirect to Admin dashboard to ensure fresh session state
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/dashboard/admin/dashboard";
    } catch (error: unknown) {
      console.error("[Demo Admin Login Error]", error);
      const err = error as Error;
      setIsLoading(false);
      showToast({
        variant: "error",
        message: err.message || "Demo login failed. Please try again.",
        duration: 5,
      });
    }
  };

  return (
    <div className="w-full pt-1">
      <button
        type="button"
        onClick={handleDemoAdminLogin}
        disabled={isLoading}
        aria-label="Demo Admin Login"
        className="
          group relative w-full overflow-hidden rounded-xl
          border border-purple-500/40 bg-gradient-to-r from-purple-950/40 via-[#9F54F7]/15 to-indigo-950/40
          p-2.5 sm:p-3 text-left transition-all duration-300
          hover:border-purple-400/80 hover:bg-[#9F54F7]/25 hover:shadow-[0_0_25px_rgba(159,84,247,0.35)]
          active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60
          cursor-pointer
        "
      >
        {/* Subtle animated ambient gradient glow */}
        <div className="absolute -inset-x-2 -inset-y-2 z-0 bg-gradient-to-r from-purple-500/0 via-[#9F54F7]/20 to-indigo-500/0 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
            {/* Icon */}
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-purple-400/40 bg-purple-500/20 text-purple-200 shadow-[0_0_12px_rgba(159,84,247,0.25)] group-hover:scale-105 group-hover:bg-purple-500/30 transition-all">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-purple-200" />
              ) : (
                <ShieldCheck className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-purple-200" />
              )}
            </div>

            {/* Labels */}
            <div className="min-w-0 flex-1 text-left">
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                <span className="text-xs sm:text-xs font-semibold tracking-tight text-purple-200 group-hover:text-white transition-colors truncate">
                  ⚡ Demo Admin Login
                </span>
                <span className="rounded-full bg-purple-500/30 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-purple-200 border border-purple-400/40 shrink-0">
                  1-Click
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 group-hover:text-zinc-200 transition-colors leading-tight mt-0.5 line-clamp-1 sm:line-clamp-none">
                <span className="inline sm:hidden">Instant Admin Access (Teacher Demo)</span>
                <span className="hidden sm:inline">Instant access to Admin Dashboard (Teacher Review)</span>
              </p>
            </div>
          </div>

          {/* Sparkles decoration (hidden on tiny screens to maximize text space) */}
          <Sparkles className="hidden min-[380px]:block h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400 group-hover:text-purple-200 group-hover:rotate-12 transition-all shrink-0" />
        </div>
      </button>
    </div>
  );
}
