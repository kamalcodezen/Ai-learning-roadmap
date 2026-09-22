"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";
import { getAdminSubscriptions } from "@/src/lib/api/admin/subscriptions";
import { updateAdminUserPlan } from "@/src/lib/actions/admin/users";
import {
  DollarSign,
  TrendingUp,
  Crown,
  Sparkles,
  Check,
  Zap,
  Users,
} from "lucide-react";
import AdminPageSkeleton from "../shared/AdminPageSkeleton";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Avatar, Select, ListBox } from "@heroui/react";

const glowCardClass =
  "group relative overflow-hidden rounded-xl p-6 transition-all duration-300 border-2 border-background shadow-none proof-card";

export default function AdminSubscriptionsView() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminSubscriptions", userId],
    queryFn: () => getAdminSubscriptions(userId!),
    enabled: !!userId,
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({
      targetId,
      newPlan,
    }: {
      targetId: string;
      newPlan: string;
    }) => updateAdminUserPlan(userId!, targetId, newPlan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
    onError: (err: Error | { message?: string }) => {
      alert(err.message || "Failed to update plan");
    },
  });

  if (isLoading && !data) {
    return <AdminPageSkeleton variant="subscriptions" />;
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load subscriptions. Please try again.</p>
      </div>
    );
  }

  const { summary, tierConfigs, recentSubscribers } = data;

  const kpis = [
    {
      title: "Estimated MRR",
      value: `$${summary.mrr.toLocaleString()}`,
      sub: "Monthly Recurring Revenue",
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      title: "Estimated ARR",
      value: `$${summary.arr.toLocaleString()}`,
      sub: "Annualized Run Rate",
      icon: TrendingUp,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Paid Subscribers",
      value: summary.totalPaid,
      sub: `${summary.plusCount} Plus · ${summary.proCount} Pro`,
      icon: Crown,
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "Conversion Rate",
      value: `${summary.conversionRate}%`,
      sub: `${summary.freeCount} Free tier learners`,
      icon: Zap,
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  return (
    <div className="flex flex-col dashboard-card-gap pb-8 animate-in fade-in duration-500">
 {/* Header */}
<div className="text-left ">
  <h1 className="section-title !text-left ">
    Subscriptions &amp; <span className="text-brand">Pricing</span>
  </h1>

  <p className="section-subtitle !mx-0 !text-left mt-1  inline">
   Supervise recurring monetization tiers, tier entitlements, and subscriber lifetime value and
user quotas
  </p>
</div>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} mouseGlow className={`${glowCardClass} rounded-lg`}>
              <CardContent className="relative z-10 flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${kpi.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Pricing Tiers & Feature Matrix */}
      <section>
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
          Platform Subscription Tiers
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {tierConfigs.map((tier) => {
            const isPro = tier.tier === "PRO";
            const isPlus = tier.tier === "PLUS";
            return (
              <Card
                key={tier.tier}
                className={`relative overflow-hidden border-2 rounded-lg p-6 ${
                  isPro
                    ? "border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-transparent"
                    : isPlus
                      ? "border-blue-500/40 bg-gradient-to-b from-blue-500/5 to-transparent"
                      : "border-border/60 bg-card/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      isPro
                        ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                        : isPlus
                          ? "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                          : "bg-muted/60 text-muted-foreground border border-border/40"
                    }`}
                  >
                    {tier.badge}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {tier.subscribersCount} Active
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-foreground">
                      ${tier.monthlyPrice}
                    </span>
                    <span className="text-xs text-muted-foreground">/ month</span>
                    {tier.yearlyPrice > 0 && (
                      <span className="text-xs font-medium text-emerald-500 ml-2">
                        (${tier.yearlyPrice}/yr)
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-border/40 pt-4 space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Included Entitlements
                  </p>
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2 text-xs text-foreground/90">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Active Subscribers Management */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Recent Paid Subscribers
          </h2>
          <span className="text-xs font-semibold text-muted-foreground">
            {recentSubscribers.length} recent paid records
          </span>
        </div>

        <Card className={`${glowCardClass} !p-0 rounded-lg`}>
          <CardContent>
            {recentSubscribers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="size-8 mx-auto mb-2 opacity-40" />
                <p>No active paid subscribers yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentSubscribers.map((u) => {
                  const isPro = u.plan === "PRO";
                  return (
                    <div
                      key={u.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <Avatar.Image src={u.image ?? undefined} alt={u.name} />
                          <Avatar.Fallback>
                            <Users className="size-4" />
                          </Avatar.Fallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{u.name}</p>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-bold uppercase tracking-wider ${
                                isPro
                                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                                  : "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                              }`}
                            >
                              {isPro ? <Crown className="size-2.5" /> : <Sparkles className="size-2.5" />}
                              {u.plan}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                          {(u.careerProfile?.targetRoleName || u.careerProfile?.targetRole) && (
                            <p className="text-[11px] font-medium text-primary mt-0.5">
                              Target: {u.careerProfile.targetRoleName || u.careerProfile.targetRole}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          Updated: {new Date(u.updatedAt).toLocaleDateString()}
                        </span>
                        <Select
                          className="w-28"
                          value={u.plan}
                          isDisabled={updatePlanMutation.isPending}
                          onChange={(val) =>
                            updatePlanMutation.mutate({ targetId: u.id, newPlan: String(val) })
                          }
                        >
                          <Select.Trigger className="h-8 text-xs rounded-lg w-30">
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover
                            className="rounded-lg! [border-radius:0.5rem]!"
                            style={{ borderRadius: "0.5rem" }}
                          >
                            <ListBox className="rounded-lg p-1">
                              <ListBox.Item key="FREE" id="FREE" textValue="FREE" className="rounded-lg text-xs">
                                FREE
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                              <ListBox.Item key="PLUS" id="PLUS" textValue="PLUS" className="rounded-lg text-xs">
                                PLUS
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                              <ListBox.Item key="PRO" id="PRO" textValue="PRO" className="rounded-lg text-xs">
                                PRO
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            </ListBox>
                          </Select.Popover>
                        </Select>
                      </div>


                      
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
