"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import {
  Monitor,
  User,
  Key,
  Bell,
  Trash2,
  AlertTriangle,
  Loader2,
  Lock,
  X,
  CreditCard,
  Crown,
  Sparkles,
  Check,
  ExternalLink,
  Zap,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";
import GenericPageSkeleton from "../../shared/GenericPageSkeleton";
import Link from "next/link";
import { authClient } from "@/src/lib/auth-client";
import { showToast } from "@/src/components/ui/toast";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  deleteUserAccount,
  NotificationPreferences,
} from "@/src/lib/api/learner/settings";

const glowCardClass =
  "group relative overflow-hidden rounded-xl p-6 transition-all duration-300 border-2 border-background shadow-none proof-card";

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Billing portal state
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  // Notification preferences query
  const { data: preferences } = useQuery<NotificationPreferences>({
    queryKey: ["notificationPreferences", session?.user?.id],
    queryFn: () => getNotificationPreferences(),
    enabled: !!session?.user?.id,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (updated: Partial<NotificationPreferences>) =>
      updateNotificationPreferences(updated),
    onMutate: async (updated) => {
      await queryClient.cancelQueries({
        queryKey: ["notificationPreferences", session?.user?.id],
      });
      const previous = queryClient.getQueryData<NotificationPreferences>([
        "notificationPreferences",
        session?.user?.id,
      ]);
      queryClient.setQueryData<NotificationPreferences>(
        ["notificationPreferences", session?.user?.id],
        (old) => ({
          emailWeeklySummary: true,
          emailAchievementAlerts: true,
          emailMilestoneReminders: true,
          browserAlerts: false,
          ...old,
          ...updated,
        })
      );
      return { previous };
    },
    onError: (_err, _updated, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["notificationPreferences", session?.user?.id],
          context.previous
        );
      }
      showToast({ message: "Failed to update notification preferences.", variant: "error" });
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(["notificationPreferences", session?.user?.id], newData);
      showToast({ message: "Notification preferences updated successfully.", variant: "success" });
    },
  });

  const handleTogglePreference = (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    updatePreferencesMutation.mutate({
      [key]: value,
    });
  };

  if (isSessionLoading) {
    return <GenericPageSkeleton />;
  }

  const user = session?.user;
  const userRole = ((user as { role?: string })?.role || "learner").toLowerCase();
  const userPlan = ((user as { plan?: string })?.plan || "FREE").toUpperCase();
  const isPro = userPlan === "PRO";
  const isPlus = userPlan === "PLUS";
  const isFree = !isPro && !isPlus;
  const profileLink = `/dashboard/${userRole}/profile`;

  const handleManageBilling = async () => {
    try {
      setIsOpeningPortal(true);
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast({
          message: data.error || "Could not open billing portal. Please contact support.",
          variant: "error",
        });
      }
    } catch {
      showToast({
        message: "Failed to open billing portal.",
        variant: "error",
      });
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast({ message: "Please enter your current and new password.", variant: "error" });
      return;
    }
    if (newPassword.length < 8) {
      showToast({ message: "New password must be at least 8 characters long.", variant: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ message: "New passwords do not match.", variant: "error" });
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (res?.error) {
        showToast({ message: res.error.message || "Could not change password.", variant: "error" });
      } else {
        showToast({ message: "Your password has been successfully updated.", variant: "success" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      showToast({ message: msg, variant: "error" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAccountDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationInput !== "DELETE") {
      showToast({ message: 'Please type "DELETE" to confirm account deletion.', variant: "error" });
      return;
    }

    try {
      setIsDeleting(true);
      const res = await deleteUserAccount("DELETE");
      if (res.success) {
        showToast({ message: "Your account and all associated data have been permanently removed.", variant: "success" });
        await authClient.signOut();
        router.push("/");
      } else {
        showToast({ message: res.message, variant: "error" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete account";
      showToast({ message: msg, variant: "error" });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const currentPrefs: NotificationPreferences = preferences || {
    emailWeeklySummary: true,
    emailAchievementAlerts: true,
    emailMilestoneReminders: true,
    browserAlerts: false,
  };

  return (
    <div className="flex flex-col pb-12 animate-in fade-in duration-500 dashboard-card-gap">
      <div>
        <h1 className="section-title text-left">
          Account <span className="text-brand">Settings</span>
        </h1>
        <p className="section-subtitle mt-1 ml-0 mr-auto text-left">
          Manage your application preferences, profile, appearance, and security configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-start dashboard-card-gap">
        {/* PERSONAL INFO CARD */}
        <Card mouseGlow className={glowCardClass}>
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
              Edit name and bio on Profile page &rarr;
            </Link>
          </CardContent>
        </Card>

        {/* APPEARANCE CARD */}
        <Card mouseGlow className={glowCardClass}>
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

        {/* SUBSCRIPTION & PLAN MANAGEMENT CARD */}
        <Card mouseGlow className={`${glowCardClass} md:col-span-2 border-primary/30`}>
          <CardHeader className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Subscription & Plan
                </CardTitle>
                <p className="text-sm text-muted-foreground">Manage your subscription, billing details, and active tier benefits.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold tracking-wider uppercase border ${
                  isPro 
                    ? "bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30" 
                    : isPlus 
                    ? "bg-primary/15 text-primary border-primary/30" 
                    : "bg-muted text-muted-foreground border-border/50"
                }`}>
                  {isPro ? <Crown className="size-3.5" /> : isPlus ? <Sparkles className="size-3.5" /> : <Zap className="size-3.5" />}
                  {isPro ? "PRO PLAN" : isPlus ? "PLUS PLAN" : "GO (FREE)"}
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-500 border border-emerald-500/20">
                  Active
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 space-y-5">
            <div className="rounded-xl border border-border/60 bg-[var(--color-card-soft)] p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    {isPro
                      ? "AI Pather Pro Tier ($99/mo)"
                      : isPlus
                      ? "AI Pather Plus Tier ($29/mo)"
                      : "AI Pather Go Tier ($0 - Free Forever)"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isPro
                      ? "Full access to organization members, candidate verification, and custom roadmaps."
                      : isPlus
                      ? "Unlimited skill proofing, AI Copilot, JD scanning & AI interview simulator."
                      : "Career Readiness Twin Diagnostics & Standard Career Roadmap Generator."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {!isPro && (
                    <Link
                      href="/#pricing"
                      className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="size-3.5" />
                      <span>{isPlus ? "Upgrade to Pro" : "Upgrade to Plus"}</span>
                    </Link>
                  )}

                  {!isFree && (
                    <button
                      type="button"
                      onClick={handleManageBilling}
                      disabled={isOpeningPortal}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {isOpeningPortal ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin text-primary" />
                          <span>Opening Stripe...</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="size-3.5 text-primary" />
                          <span>Manage Billing & Invoices</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Feature checklist */}
              <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary shrink-0" />
                  <span>Interactive Career Roadmaps</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary shrink-0" />
                  <span>Career Readiness Diagnostics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`size-3.5 shrink-0 ${!isFree ? "text-primary" : "text-muted-foreground/40"}`} />
                  <span className={!isFree ? "text-foreground font-medium" : "line-through text-muted-foreground/60"}>
                    Job Reality & JD Scanner
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`size-3.5 shrink-0 ${!isFree ? "text-primary" : "text-muted-foreground/40"}`} />
                  <span className={!isFree ? "text-foreground font-medium" : "line-through text-muted-foreground/60"}>
                    AI Mock Interview Simulator
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`size-3.5 shrink-0 ${!isFree ? "text-primary" : "text-muted-foreground/40"}`} />
                  <span className={!isFree ? "text-foreground font-medium" : "line-through text-muted-foreground/60"}>
                    Skill Simulation Assessments
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`size-3.5 shrink-0 ${isPro ? "text-primary" : "text-muted-foreground/40"}`} />
                  <span className={isPro ? "text-foreground font-medium" : "line-through text-muted-foreground/60"}>
                    Recruiter Verification & Org Portal
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NOTIFICATION PREFERENCES CARD */}
        <Card mouseGlow className={`${glowCardClass} md:col-span-2`}>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notification Preferences
            </CardTitle>
            <p className="text-sm text-muted-foreground">Configure how and when you receive updates.</p>
          </CardHeader>
          <CardContent className="relative z-10 space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-[var(--color-card-soft)] rounded-xl border border-border/60">
              <div>
                <label
                  htmlFor="pref-emailWeeklySummary"
                  className="text-sm font-semibold text-foreground cursor-pointer block"
                >
                  Weekly Learning Progress Summary
                </label>
                <p className="text-xs text-muted-foreground">Receive weekly digest of completed milestones and skill readiness delta.</p>
              </div>
              <label
                htmlFor="pref-emailWeeklySummary"
                className="relative inline-flex items-center cursor-pointer shrink-0 ml-4"
              >
                <input
                  id="pref-emailWeeklySummary"
                  name="emailWeeklySummary"
                  type="checkbox"
                  checked={Boolean(currentPrefs.emailWeeklySummary)}
                  onChange={(e) =>
                    handleTogglePreference("emailWeeklySummary", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[var(--color-card-soft)] rounded-xl border border-border/60">
              <div>
                <label
                  htmlFor="pref-emailAchievementAlerts"
                  className="text-sm font-semibold text-foreground cursor-pointer block"
                >
                  Achievement & Badge Unlocks
                </label>
                <p className="text-xs text-muted-foreground">Get notified when you earn XP rewards and new achievement badges.</p>
              </div>
              <label
                htmlFor="pref-emailAchievementAlerts"
                className="relative inline-flex items-center cursor-pointer shrink-0 ml-4"
              >
                <input
                  id="pref-emailAchievementAlerts"
                  name="emailAchievementAlerts"
                  type="checkbox"
                  checked={Boolean(currentPrefs.emailAchievementAlerts)}
                  onChange={(e) =>
                    handleTogglePreference("emailAchievementAlerts", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[var(--color-card-soft)] rounded-xl border border-border/60">
              <div>
                <label
                  htmlFor="pref-emailMilestoneReminders"
                  className="text-sm font-semibold text-foreground cursor-pointer block"
                >
                  Milestone & Study Pace Reminders
                </label>
                <p className="text-xs text-muted-foreground">Reminders to maintain your weekly study pace and keep active streak.</p>
              </div>
              <label
                htmlFor="pref-emailMilestoneReminders"
                className="relative inline-flex items-center cursor-pointer shrink-0 ml-4"
              >
                <input
                  id="pref-emailMilestoneReminders"
                  name="emailMilestoneReminders"
                  type="checkbox"
                  checked={Boolean(currentPrefs.emailMilestoneReminders)}
                  onChange={(e) =>
                    handleTogglePreference("emailMilestoneReminders", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[var(--color-card-soft)] rounded-xl border border-border/60">
              <div>
                <label
                  htmlFor="pref-browserAlerts"
                  className="text-sm font-semibold text-foreground cursor-pointer block"
                >
                  Browser & In-App Alerts
                </label>
                <p className="text-xs text-muted-foreground">Receive real-time push and in-app alerts when active in the dashboard.</p>
              </div>
              <label
                htmlFor="pref-browserAlerts"
                className="relative inline-flex items-center cursor-pointer shrink-0 ml-4"
              >
                <input
                  id="pref-browserAlerts"
                  name="browserAlerts"
                  type="checkbox"
                  checked={Boolean(currentPrefs.browserAlerts)}
                  onChange={(e) =>
                    handleTogglePreference("browserAlerts", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* SECURITY & INLINE PASSWORD CHANGE CARD */}
        <Card mouseGlow className={`${glowCardClass} md:col-span-2`}>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> Security & Password
            </CardTitle>
            <p className="text-sm text-muted-foreground">Update your account password directly.</p>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4 text-sm">
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <Lock className="w-4 h-4 text-muted-foreground absolute right-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 dashboard-card-gap">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5 text-white" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>

                <Link
                  href="/forgot-password"
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  Forgot password?
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* DANGER ZONE: ACCOUNT DELETION */}
        <Card mouseGlow className="md:col-span-2 border-destructive/40 bg-destructive/5 dark:bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> Danger Zone
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Permanently remove your account and all associated learner data.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-red-500 border bg-background">
              <div>
                <p className="text-sm font-semibold text-foreground">Delete Account</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Once deleted, your roadmaps, project evidence, mock interviews, and assessment history cannot be recovered.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmationInput("");
                  setShowDeleteModal(true);
                }}
                className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-xl bg-red-500 text-white hover:opacity-90 transition cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-background border border-red-500 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-red-500">Delete Account Permanently</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This action is <strong className="text-destructive">permanent and irreversible</strong>. It will delete your profile, roadmap progress, project submissions, mock interviews, diagnostic results, and all earned achievements.
            </p>

            <form onSubmit={handleAccountDelete} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  To confirm, type <span className="font-bold text-destructive">DELETE</span> below:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationInput}
                  onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-destructive"
                  required
                />
              </div>

              <div className="flex justify-end items-center gap-2.5 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-xl border border-border hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmationInput !== "DELETE" || isDeleting}
                  className="px-4 py-2 text-xs font-semibold text-destructive-foreground bg-destructive hover:opacity-90 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting Account...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

