"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone,
  Send,
  Users,
  AlertCircle,
  Radio,
  Clock,
  ExternalLink,
  Loader2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { authClient } from "@/src/lib/auth-client";
import { getAdminBroadcasts, createAdminBroadcast } from "@/src/lib/api/admin/broadcasts";
import { GlowCard } from "@/src/components/dashboard/shared/cards";
import { showToast } from "@/src/components/ui/toast";
import AdminPageSkeleton from "@/src/components/dashboard/admin/shared/AdminPageSkeleton";

export default function AdminBroadcastsView() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetCohort, setTargetCohort] = useState<"ALL" | "FREE" | "PLUS" | "PRO">("ALL");
  const [priority, setPriority] = useState<"NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [actionUrl, setActionUrl] = useState("/dashboard/learner");

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminBroadcasts", userId],
    queryFn: () => getAdminBroadcasts(userId!),
    enabled: !!userId,
  });

  const sendMutation = useMutation({
    mutationFn: (payload: {
      title: string;
      message: string;
      targetCohort: "ALL" | "FREE" | "PLUS" | "PRO";
      priority: "NORMAL" | "HIGH" | "URGENT";
      actionUrl?: string;
    }) => createAdminBroadcast(userId!, payload),
    onSuccess: () => {
      showToast({ variant: "success", message: "Announcement broadcast dispatched successfully!" });
      setTitle("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["adminBroadcasts"] });
    },
    onError: (err: Error) => {
      showToast({ variant: "error", message: err.message || "Failed to dispatch broadcast." });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      return showToast({ variant: "error", message: "Please provide both a title and message." });
    }

    sendMutation.mutate({
      title: title.trim(),
      message: message.trim(),
      targetCohort,
      priority,
      actionUrl: actionUrl.trim() || undefined,
    });
  };

  if (isLoading && !data) {
    return <AdminPageSkeleton variant="broadcasts" />;
  }

  if (error || !data) {
    return (
      <div className="flex h-[350px] flex-col items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <p className="text-red-500 font-semibold">Unable to load broadcast center</p>
        <p className="text-xs text-muted-foreground mt-1">Please ensure backend server is active.</p>
      </div>
    );
  }

  const { stats, broadcasts } = data;

  return (
    <div className="flex flex-col dashboard-card-gap pb-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">
            Broadcast &amp; <span className="text-brand">Announcements</span>
          </h1>
          <p className="section-subtitle mt-1 !text-left !mx-0 max-w-none">
            Dispatch announcements, push notifications, and release updates to learner cohorts
          </p>
        </div>
      </div>

      {/* ============================= STATS SUMMARY ============================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 dashboard-card-gap">
        <GlowCard corner="top-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Learners</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-poppins text-foreground mt-2">
            {stats?.totalLearners ?? 0}
          </p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Active Reachable Audience</span>
        </GlowCard>

        <GlowCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pro Cohort</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-poppins text-amber-500 mt-2">
            {stats?.cohortBreakdown?.PRO ?? 0}
          </p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Pro Subscription Tier</span>
        </GlowCard>

        <GlowCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plus Cohort</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Radio className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-poppins text-primary mt-2">
            {stats?.cohortBreakdown?.PLUS ?? 0}
          </p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Plus Subscription Tier</span>
        </GlowCard>

        <GlowCard corner="top-right">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dispatches</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Megaphone className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-poppins text-foreground mt-2">
            {stats?.totalBroadcastsSent ?? 0}
          </p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Total Broadcasts Sent</span>
        </GlowCard>
      </div>

      {/* ============================= COMPOSER & HISTORY ============================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 dashboard-card-gap">
        {/* Composer Card */}
        <div className="lg:col-span-5">
          <div className="glow-card group relative overflow-hidden rounded-xl border border-border p-5 sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/50 mb-5">
              <div>
                <h3 className="text-base font-bold font-poppins text-foreground flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" />
                  Compose Broadcast
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Send system announcements directly to learner notification centers
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Push
              </span>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Announcement Title
                </label>
                <input
                  id="broadcast-title"
                  aria-label="Announcement Title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Major Platform Roadmap Update"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="broadcast-target" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Target Audience
                  </label>
                  <div className="relative">
                    <select
                      id="broadcast-target"
                      aria-label="Target Audience Cohort"
                      value={targetCohort}
                      onChange={(e) => setTargetCohort(e.target.value as "ALL" | "FREE" | "PLUS" | "PRO")}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                    >
                      <option value="ALL">All Learners ({stats?.totalLearners ?? 0})</option>
                      <option value="PRO">Pro Members Only ({stats?.cohortBreakdown?.PRO ?? 0})</option>
                      <option value="PLUS">Plus Members ({stats?.cohortBreakdown?.PLUS ?? 0})</option>
                      <option value="FREE">Free Tier ({stats?.cohortBreakdown?.FREE ?? 0})</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label htmlFor="broadcast-priority" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <div className="relative">
                    <select
                      id="broadcast-priority"
                      aria-label="Announcement Priority Level"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as "NORMAL" | "HIGH" | "URGENT")}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                    >
                      <option value="NORMAL">Normal Info</option>
                      <option value="HIGH">High Priority</option>
                      <option value="URGENT">Urgent Alert</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="broadcast-action-url" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Action Link (Optional)
                </label>
                <input
                  id="broadcast-action-url"
                  aria-label="Deep Link Action URL"
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="/dashboard/learner/learning-path"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label htmlFor="broadcast-message" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Announcement Message
                </label>
                <textarea
                  id="broadcast-message"
                  aria-label="Announcement Message Content"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the update, feature release, or scheduled maintenance in detail..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sendMutation.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
              >
                {sendMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span className="text-white">Dispatching to {targetCohort} Learners...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 text-white" />
                    <span className="text-white">Dispatch Broadcast Announcement</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Dispatch Log / History */}
        <div className="lg:col-span-7">
          <div className="glow-card group relative overflow-hidden rounded-xl border border-border p-5 sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/50 mb-4">
              <div>
                <h3 className="text-base font-bold font-poppins text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Broadcast Transmission Log
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  History of platform-wide notifications and announcements
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                {broadcasts?.length ?? 0} Recorded
              </span>
            </div>

            <div className="space-y-3">
              {!broadcasts || broadcasts.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No announcements broadcast yet.
                </div>
              ) : (
                broadcasts.map((bc: {
                  id: string;
                  title: string;
                  message: string;
                  targetCohort: string;
                  priority: string;
                  actionUrl?: string;
                  recipientsCount: number;
                  sentAt: string;
                  senderName: string;
                }) => (
                  <div
                    key={bc.id}
                    className="p-4 rounded-xl bg-muted/20 border border-border/40 hover:border-primary/40 transition-all space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            bc.priority === "URGENT"
                              ? "bg-red-500/10 text-red-500 border-red-500/20"
                              : bc.priority === "HIGH"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          {bc.priority}
                        </span>
                        <span className="text-xs font-bold text-foreground">{bc.title}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3 text-primary" />
                          <strong className="text-foreground">{bc.recipientsCount}</strong> {bc.targetCohort}
                        </span>
                        <span>•</span>
                        <span>{new Date(bc.sentAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {bc.message}
                    </p>

                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border/30 text-[11px] text-muted-foreground">
                      <span>Sender: <strong className="text-foreground">{bc.senderName}</strong></span>
                      {bc.actionUrl && (
                        <span className="flex items-center gap-1 text-primary font-medium hover:underline">
                          <ExternalLink className="h-3 w-3" />
                          {bc.actionUrl}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
