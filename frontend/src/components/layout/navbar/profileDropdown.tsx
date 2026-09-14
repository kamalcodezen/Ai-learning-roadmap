"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Crown,
  Zap,
  Loader2,
} from "lucide-react";
import { authClient } from "@/src/lib/auth-client";

interface ProfileDropdownProps {
  name: string;
  email?: string;
}

export const getPlanBadge = (plan?: string) => {
  const userPlan = plan?.toUpperCase() || "FREE";
  switch (userPlan) {
    case "PRO":
      return {
        label: "PRO",
        icon: Crown,
        style: "bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30",
      };
    case "PLUS":
      return {
        label: "PLUS",
        icon: Sparkles,
        style: "bg-primary/15 text-primary border-primary/30",
      };
    default:
      return {
        label: "GO (FREE)",
        icon: Zap,
        style: "bg-muted text-muted-foreground border-border/50",
      };
  }
};

export const getDropdownLinks = (role: string, prefix: string) => {
  const isRoleAdmin = role === "ADMIN";
  return [
    {
      label: isRoleAdmin ? "Admin Dashboard" : "Dashboard",
      href: isRoleAdmin ? `${prefix}/dashboard` : `${prefix}`,
      variant: "default",
    },
    {
      label: "My Profile",
      href: `${prefix}/profile`,
      variant: "default",
    },
    {
      label: "Settings & Billing",
      href: `${prefix}/settings`,
      variant: "default",
    },
    {
      label: "Sign out",
      href: "#",
      variant: "danger",
    },
  ] as const;
};

export default function ProfileDropdown({
  name,
  email,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: session } = authClient.useSession();
  const user = session?.user as { role?: string; plan?: string; image?: string | null } | undefined;
  const userRole = user?.role?.toUpperCase() || "LEARNER";
  const userPlan = user?.plan?.toUpperCase() || "FREE";
  const prefix = userRole === "ADMIN" ? "/dashboard/admin" : "/dashboard/learner";

  const desktopNavItems = [
    {
      label: userRole === "ADMIN" ? "Admin Dashboard" : "Dashboard",
      href: userRole === "ADMIN" ? `${prefix}/dashboard` : `${prefix}`,
      icon: LayoutDashboard,
    },
    {
      label: "My Profile",
      href: `${prefix}/profile`,
      icon: UserIcon,
    },
    {
      label: "Settings & Billing",
      href: `${prefix}/settings`,
      icon: Settings,
    },
  ];

  const initial = (name?.trim() || "U").charAt(0).toUpperCase();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setOpen(false);
          router.replace("/");
          router.refresh();
        },
        onError: () => {
          setOpen(false);
          router.replace("/");
          router.refresh();
        },
      },
    });
    setIsSigningOut(false);
  };

  const planBadge = getPlanBadge(userPlan);
  const PlanIcon = planBadge.icon;

  return (
    <div
      ref={dropdownRef}
      className="relative inline-block text-left"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="group relative flex items-center gap-2 rounded-full border border-primary/30 bg-card/80 py-1 pl-1 pr-3 text-foreground backdrop-blur-md transition-all duration-200 hover:border-primary/60 hover:shadow-[0_0_16px_rgba(159,84,247,0.2)] focus:outline-none"
      >
        {/* User Avatar Circle */}
        <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-primary to-secondary text-xs font-bold text-white shadow-xs">
          {user?.image ? (
            <Image
              src={user.image}
              alt={name || "User"}
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>

        {/* User First Name */}
        <span className="hidden max-w-28 truncate text-xs font-semibold tracking-wide text-foreground sm:inline-block">
          {name?.split(" ")[0] || "Account"}
        </span>

        {/* Smooth Chevron */}
        <ChevronDown
          className={`size-3.5 text-muted-foreground transition-transform duration-200 group-hover:text-primary ${
            open ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            className="absolute right-0 top-[calc(100%+6px)] z-50 w-72 origin-top-right max-h-[85vh] overflow-y-auto overscroll-contain rounded-2xl border border-border/80 bg-card/95 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-2xl dark:border-primary/20 dark:bg-[#120722]/95 dark:shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
          >
            {/* Header: User Profile Info */}
            <div className="rounded-xl border border-border/50 bg-muted/40 p-3.5">
              <div className="flex items-center gap-3">
                {/* Avatar with active indicator */}
                <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-primary to-secondary text-sm font-bold text-white shadow-xs">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={name || "User"}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <span>{initial}</span>
                  )}
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
                </div>

                {/* Name, Email, & Tier Badge */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className="truncate text-sm font-bold text-foreground">
                      {name || "User"}
                    </p>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider border ${planBadge.style}`}
                    >
                      <PlanIcon className="size-2.5" />
                      {planBadge.label}
                    </span>
                  </div>

                  <p className="truncate text-xs text-muted-foreground mt-0.5">
                    {email || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Plan Upgrade Card */}
            <div className="mt-2 px-1">
              {userPlan === "FREE" && (
                <Link
                  href="/#pricing"
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-primary to-secondary px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-95"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-yellow-300" />
                    <span>Upgrade to Plus</span>
                  </span>
                  <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">
                    Save 20%
                  </span>
                </Link>
              )}

              {userPlan === "PLUS" && (
                <Link
                  href="/#pricing"
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500 to-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-95"
                >
                  <span className="flex items-center gap-1.5">
                    <Crown className="size-3.5 text-yellow-200" />
                    <span>Upgrade to Pro</span>
                  </span>
                  <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">
                    Enterprise
                  </span>
                </Link>
              )}

              {userPlan === "PRO" && (
                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500 dark:text-amber-400">
                  <Crown className="size-3.5" />
                  <span>Verified Pro Member</span>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="mt-2 space-y-0.5">
              {desktopNavItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground/80 transition-colors hover:bg-muted/70 hover:text-primary"
                  >
                    <ItemIcon className="size-4 text-primary shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="my-1.5 h-px bg-border/60" />

              {/* Sign out button */}
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/10 disabled:pointer-events-none disabled:opacity-60 cursor-pointer"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-red-500 shrink-0" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="size-4 text-red-500 shrink-0" />
                    <span>Sign out</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
