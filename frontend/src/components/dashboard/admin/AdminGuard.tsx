"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Lock, ArrowRight, LogOut } from "lucide-react";
import { authClient } from "@/src/lib/auth-client";
import AdminPageSkeleton from "./shared/AdminPageSkeleton";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [countdown, setCountdown] = useState(5);

  const user = session?.user;
  const userRole = ((user as { role?: string })?.role || "").toUpperCase();
  const isAdmin = userRole === "ADMIN";

  // Safe auto-redirect timer for non-admins
  useEffect(() => {
    if (isPending) return;

    if (!user || !isAdmin) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(user ? "/dashboard/learner" : "/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user, isAdmin, isPending, router]);

  // Loading state while verifying cryptographic session
  if (isPending) {
    return <AdminPageSkeleton variant="dashboard" />;
  }

  // 403 Forbidden Screen for Non-Admin Users (e.g. Learners tampering with URL)
  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-[80vh] w-full flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative w-full max-w-lg rounded-3xl border border-rose-500/30 bg-card p-6 sm:p-8 text-center shadow-2xl shadow-rose-500/10">
          {/* Glowing Security Shield Icon */}
          <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-inner">
            <ShieldAlert className="size-10 stroke-[1.8]" />
          </div>

          {/* Status Badge */}
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
            <Lock className="size-3" />
            403 Forbidden — Admin Only
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Unauthorized Access
          </h1>

          {/* Explanation */}
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The Administrative Console is strictly restricted to verified system administrators. 
            Your current account role is{" "}
            <span className="font-bold text-rose-500">
              {userRole || "GUEST / UNKNOWN"}
            </span>. 
            You do not have permission to view or manipulate administrative telemetry.
          </p>

          {/* Current User Info Card */}
          {user && (
            <div className="mt-5 rounded-xl border border-border/80 bg-muted/40 p-3 text-left text-xs flex items-center justify-between">
              <div className="truncate pr-2">
                <span className="text-xs uppercase font-bold text-muted-foreground block">Signed In As</span>
                <span className="font-semibold text-foreground truncate block">{user.email}</span>
              </div>
              <span className="shrink-0 rounded-md bg-foreground/10 px-2.5 py-0.5 text-xs font-bold uppercase">
                {userRole}
              </span>
            </div>
          )}

          {/* Countdown Notification */}
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            Redirecting you back to your Learner Dashboard in{" "}
            <span className="font-bold text-rose-500">{countdown}s</span>...
          </p>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/learner"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
            >
              <span>Return to Learner Dashboard</span>
              <ArrowRight className="size-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/60 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verified System Administrator — Grant Access
  return <>{children}</>;
}
