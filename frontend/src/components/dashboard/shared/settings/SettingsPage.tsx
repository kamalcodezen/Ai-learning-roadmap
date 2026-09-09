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
  "group relative overflow-hidden rounded-xl p-6 transition-all duration-300 border-2 border-background hover:border-brand shadow-none bg-[linear-gradient(to_bottom,#faf5ff_0%,#f3edff_45%,#ede5ff_100%)] dark:bg-[linear-gradient(to_bottom,#1a0e2e_0%,rgba(159,84,247,0.15)_100%)]";

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

  // Notification preferences query
  const { data: preferences } = useQuery<NotificationPreferences>({
    queryKey: ["notificationPreferences", session?.user?.id],
    queryFn: () => getNotificationPreferences(),
    enabled: !!session?.user?.id,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (updated: Partial<NotificationPreferences>) =>
      updateNotificationPreferences(updated),
    onSuccess: (newData) => {
      queryClient.setQueryData(["notificationPreferences", session?.user?.id], newData);
      showToast({ message: "Notification preferences updated successfully.", variant: "success" });
    },
    onError: () => {
      showToast({ message: "Failed to update notification preferences.", variant: "error" });
    },
  });

  if (isSessionLoading) {
    return <GenericPageSkeleton />;
  }

  const user = session?.user;
  const userRole = ((user as { role?: string })?.role || "learner").toLowerCase();
  const profileLink = `/dashboard/${userRole}/profile`;

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
              Edit name and bio on Profile page &rarr;
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

        {/* NOTIFICATION PREFERENCES CARD */}
        <Card mouseGlow className={`${glowCardClass} md:col-span-2`}>
          <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notification Preferences
            </CardTitle>
            <p className="text-sm text-muted-foreground">Configure how and when you receive updates.</p>
          </CardHeader>
          <CardContent className="relative z-10 space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-[var(--color-card-soft)] rounded-xl border border-border/60">
              <div>
                <p className="text-sm font-semibold text-foreground">Weekly Learning Progress Summary</p>
                <p className="text-xs text-muted-foreground">Receive weekly digest of completed milestones and skill readiness delta.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentPrefs.emailWeeklySummary}
                  onChange={(e) =>
                    updatePreferencesMutation.mutate({
                      emailWeeklySummary: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[var(--color-card-soft)] rounded-xl border border-border/60">
              <div>
                <p className="text-sm font-semibold text-foreground">Achievement & Badge Unlocks</p>
                <p className="text-xs text-muted-foreground">Get notified when you earn XP rewards and new achievement badges.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentPrefs.emailAchievementAlerts}
                  onChange={(e) =>
                    updatePreferencesMutation.mutate({
                      emailAchievementAlerts: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[var(--color-card-soft)] rounded-xl border border-border/60">
              <div>
                <p className="text-sm font-semibold text-foreground">Milestone & Study Pace Reminders</p>
                <p className="text-xs text-muted-foreground">Reminders to maintain your weekly study pace and keep active streak.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentPrefs.emailMilestoneReminders}
                  onChange={(e) =>
                    updatePreferencesMutation.mutate({
                      emailMilestoneReminders: e.target.checked,
                    })
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
          <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:opacity-95 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>

                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/30 bg-destructive/10">
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
                className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 transition cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
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
          <div className="bg-card border border-destructive/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-bold">Delete Account Permanently</h3>
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

