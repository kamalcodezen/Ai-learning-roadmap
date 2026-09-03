"use client";

import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Monitor, User, Mail, Shield, Key } from "lucide-react";
import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";
import GenericPageSkeleton from "../../shared/GenericPageSkeleton";
import Link from "next/link";

const glowCardClass =
  "group relative overflow-hidden rounded-md p-6 transition-all duration-300 border-2 border-background hover:border-brand shadow-none bg-[linear-gradient(to_bottom,#faf5ff_0%,#f3edff_45%,#ede5ff_100%)] dark:bg-[linear-gradient(to_bottom,#1a0e2e_0%,rgba(159,84,247,0.15)_100%)]";

export default function SettingsPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  if (isSessionLoading) {
    return <GenericPageSkeleton />;
  }

  const user = session?.user;
  const userRole = ((user as { role?: string })?.role || "learner").toLowerCase();
  const profileLink = `/dashboard/${userRole}/profile`;

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="section-title text-left">
          Account <span className="text-brand">Settings</span>
        </h1>
        <p className="section-subtitle mt-1 ml-0 mr-auto text-left">
          Manage your application preferences, profile, appearance, and security configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* PERSONAL INFO CARD */}
        <Card mouseGlow className={glowCardClass}>
          <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Personal Information
            </CardTitle>
            <p className="text-sm text-muted-foreground">Your basic account details.</p>
          </CardHeader>
          <CardContent className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg truncate">{user?.name || "User"}</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>

            <Link href={profileLink} className="inline-block text-sm font-semibold text-primary hover:text-secondary transition-colors">
              Edit name on Profile page &rarr;
            </Link>
          </CardContent>
        </Card>

        {/* APPEARANCE CARD */}
        <Card mouseGlow className={glowCardClass}>
          <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" /> Appearance
            </CardTitle>
            <p className="text-sm text-muted-foreground">Customize the look and feel of the application.</p>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <div className="flex items-center justify-between p-3 bg-[var(--color-card-soft)] rounded-lg border border-border/60">
              <div>
                <p className="font-medium">Theme Toggle</p>
                <p className="text-xs text-muted-foreground">Switch between Light and Dark mode</p>
              </div>
              <div className="bg-background border border-border rounded-full flex items-center justify-center">
                <AnimatedThemeToggler />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECURITY CARD */}
        <Card mouseGlow className={`${glowCardClass} md:col-span-2`}>
          <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> Security Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground">Manage your password and account access.</p>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href={profileLink}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-[var(--color-card-soft)] border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Change Password on Profile</span>
              </Link>

              <Link
                href="/forgot-password"
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-[var(--color-card-soft)] border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Reset Password via Email</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
