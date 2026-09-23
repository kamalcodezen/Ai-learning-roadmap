"use client";

import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";
import SidebarHeader from "./SidebarHeader";
import ProfileCard from "./ProfileCard";
import SidebarNav from "./SidebarNav";
import SignOutButton from "./SignOutButton";
import { useDashboardSession } from "../sessionGuard/SessionGuard";

interface SidebarContentProps {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
  indicatorId: string;
  onClose?: () => void;
  onNavigate?: () => void;
}

export default function SidebarContent({
  userName,
  userEmail,
  userImage,
  indicatorId,
  onClose,
  onNavigate,
}: SidebarContentProps) {
  const { data: session } = useDashboardSession();
  const user = session?.user as { role?: string; plan?: string; image?: string | null } | undefined;
  const userRole = (user?.role || "LEARNER").toUpperCase();
  const userPlan = (user?.plan || "FREE").toUpperCase();
  const isPro = userPlan === "PRO";
  const isAdmin = userRole === "ADMIN";

  return (
    <div className="flex h-full w-full flex-col">
      <SidebarHeader onClose={onClose} />

      <div className="px-4 pt-2 pb-2">
        <ProfileCard name={userName} email={userEmail} plan={userPlan} image={userImage || user?.image} />
      </div>

      <div
        data-lenis-prevent="true"
        data-lenis-prevent-wheel="true"
        data-lenis-prevent-touch="true"
        className="mt-1 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain touch-pan-y"
        style={{ touchAction: "pan-y" }}
      >
        <SidebarNav indicatorId={indicatorId} onItemClick={onNavigate} />
      </div>

      {/* Dynamic Plan Upgrade Banner for Free/Plus users */}
      {!isAdmin && !isPro && (
        <div className="px-4 py-2">
          <Link
            href="/pricing"
            onClick={onNavigate}
            className="group relative flex flex-col gap-1.5 overflow-hidden rounded-xl border border-primary/30 bg-[linear-gradient(to_bottom,rgba(159,84,247,0.12)_0%,rgba(133,35,245,0.06)_100%)] p-3 text-left transition-all hover:border-primary/60 hover:shadow-[0_0_20px_rgba(159,84,247,0.2)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                {userPlan === "PLUS" ? (
                  <>
                    <Sparkles className="size-3.5 text-primary" />
                    Upgrade to Pro
                  </>
                ) : (
                  <>
                    <Zap className="size-3.5 text-primary" />
                    Unlock All AI Features
                  </>
                )}
              </span>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">
                {userPlan === "PLUS" ? "PRO" : "PLUS"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-snug">
              {userPlan === "PLUS"
                ? "Unlock AI Resume, Proof Graph & Career Intelligence."
                : "Unlock Job Reality, Assessments, and Mock Interviews."}
            </p>
          </Link>
        </div>
      )}

      <SignOutButton onSignOut={onNavigate} />
    </div>
  );
}
