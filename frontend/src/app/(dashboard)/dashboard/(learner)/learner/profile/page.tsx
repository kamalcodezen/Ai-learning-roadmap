"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Calendar, GraduationCap, Clock, Sliders, Check, X, Loader2 } from "lucide-react";
import { getDashboardOverview } from "@/src/lib/api/learner/dashboard";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import GenericPageSkeleton from "@/src/components/dashboard/shared/GenericPageSkeleton";
import DashboardProfile from "@/src/components/dashboard/shared/profile/DashboardProfile";
import type { ProfileChart } from "@/src/components/dashboard/shared/profile/DashboardProfile";
import CareerGoalAnalysis from "@/src/components/profile/CareerGoalAnalysis";
import { updateCareerProfile } from "@/src/lib/actions/learner/career-profile";
import { showToast } from "@/src/components/ui/toast";

const COVER_IMAGE = "/images/dashboardBanner.png";
const COVER_IMAGE_DARK = "/images/dashboardBannerDark.png";

export default function LearnerProfilePage() {
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  const { data, isPending: isDashboardPending } = useQuery({
    queryKey: ["dashboardData", session?.user?.id],
    queryFn: () => getDashboardOverview(),
    enabled: !!session?.user?.id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedRole, setEditedRole] = useState("");
  const [editedHours, setEditedHours] = useState<number>(10);
  const [editedLevel, setEditedLevel] = useState<"BEGINNER" | "INTERMEDIATE">("BEGINNER");

  const updateMutation = useMutation({
    mutationFn: async (payload: { targetRole: string; targetRoleName: string; experienceLevel: "BEGINNER" | "INTERMEDIATE"; weeklyAvailableHours: number }) => {
      const res = await updateCareerProfile({
        userId: session?.user?.id,
        ...payload,
      });
      if (!res.success) throw new Error(res.message || "Failed to update profile");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: ["careerAnalysis"] });
      showToast({ message: "Profile updated: Career target and study pace saved.", variant: "success" });
      setIsEditing(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      showToast({ message: `Update failed: ${msg}`, variant: "error" });
    },
  });

  const quickMetrics = useMemo(() => {
    if (!data) return [];
    const r = data.readiness;
    return [
      { label: "Knowledge", value: String(r?.knowledge ?? 0) },
      { label: "Practical", value: String(r?.practical ?? 0) },
      { label: "Projects", value: String(r?.projects ?? 0) },
      { label: "Problem Solve", value: String(r?.problemSolving ?? 0) },
    ];
  }, [data]);

  const chart: ProfileChart | undefined = useMemo(() => {
    if (!data) return undefined;
    const r = data.readiness;
    const grouped = [
      { name: "Knowledge", value: r?.knowledge ?? 0 },
      { name: "Practical", value: r?.practical ?? 0 },
      { name: "Projects", value: r?.projects ?? 0 },
      { name: "Problem", value: r?.problemSolving ?? 0 },
      { name: "Comm", value: r?.communication ?? 0 },
      { name: "Interview", value: r?.interview ?? 0 },
    ];
    return {
      title: "Readiness Profile",
      subtitle: "Your learning progress and readiness across skill areas",
      data: grouped,
      xKey: "name",
      yKey: "value",
    };
  }, [data]);

  if (isSessionLoading || isDashboardPending) {
    return <GenericPageSkeleton />;
  }

  const targetRole = data?.career?.targetRole || "Learner";
  const weeklyHours = data?.career?.weeklyAvailableHours ?? 10;
  const experienceLevel = (data?.career?.experienceLevel as "BEGINNER" | "INTERMEDIATE") || "BEGINNER";

  const handleOpenEdit = () => {
    setEditedRole(targetRole);
    setEditedHours(weeklyHours);
    setEditedLevel(experienceLevel);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedRole.trim()) return;
    updateMutation.mutate({
      targetRole: editedRole.trim(),
      targetRoleName: editedRole.trim(),
      experienceLevel: editedLevel,
      weeklyAvailableHours: Number(editedHours),
    });
  };

  return (
    <div className="pb-10">
      <DashboardProfile
        coverImage={COVER_IMAGE}
        coverImageDark={COVER_IMAGE_DARK}
        roleLabel="Learner"
        bio={`Focused on becoming a ${targetRole}.`}
        metaItems={[
          { icon: GraduationCap, label: targetRole },
          { icon: Clock, label: `${weeklyHours}h/week` },
          { icon: MapPin, label: "AI Pather" },
          { icon: Calendar, label: "Joined 2026" },
        ]}
        introItems={[
          {
            icon: "📧",
            label: "Email",
            value: session?.user?.email || "learner@aipather.com",
          },
          {
            icon: "📈",
            label: "Active Status",
            value: <span className="text-green-500 font-bold">Verified</span>,
          },
          {
            icon: "🎯",
            label: "Target Role",
            value: targetRole,
          },
          {
            icon: "⏱️",
            label: "Study Pace",
            value: `${weeklyHours} hrs / week`,
          },
        ]}
        quickMetrics={quickMetrics}
        chart={chart}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Career & Pace Inline Quick Editor Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              Career Target & Study Pace
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Currently preparing for <span className="font-semibold text-foreground">{targetRole}</span> ({experienceLevel.toLowerCase()}) at <span className="font-semibold text-foreground">{weeklyHours} hours/week</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenEdit}
            className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-95 transition cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Edit Target & Pace</span>
          </button>
        </div>

        {/* Inline Modal for Editing Career Profile */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  Edit Career Goal & Weekly Hours
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Target Role
                  </label>
                  <select
                    value={editedRole}
                    onChange={(e) => setEditedRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                  >
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="AI Engineer">AI Engineer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Mobile Developer">Mobile Developer</option>
                    <option value="Data Engineer">Data Engineer</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Experience Level
                    </label>
                    <select
                      value={editedLevel}
                      onChange={(e) => setEditedLevel(e.target.value as "BEGINNER" | "INTERMEDIATE")}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                    >
                      <option value="BEGINNER">Beginner (0-2 yrs)</option>
                      <option value="INTERMEDIATE">Intermediate (2+ yrs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Weekly Study Pace
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="80"
                        value={editedHours}
                        onChange={(e) => setEditedHours(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                        required
                      />
                      <span className="text-xs text-muted-foreground shrink-0 font-medium">hrs/wk</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-2.5 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-xl border border-border hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <CareerGoalAnalysis />
      </div>
    </div>
  );
}