"use client";

export type AdminSkeletonVariant =
  | "default"
  | "table"
  | "dashboard"
  | "analytics"
  | "sandbox"
  | "system-health"
  | "subscriptions"
  | "broadcasts"
  | "split-cards"
  | "ai-usage"
  | "profile";

interface AdminPageSkeletonProps {
  variant?: AdminSkeletonVariant;
  hasHeader?: boolean;
  hasKpis?: boolean;
  kpiCount?: number;
  hasTable?: boolean;
  tableRows?: number;
  hasSearch?: boolean;
  hasToolbar?: boolean;
  dropdownCount?: number;
}

export default function AdminPageSkeleton({
  variant = "table",
  hasHeader = true,
  hasKpis = true,
  kpiCount = 4,
  hasTable = true,
  tableRows = 6,
  hasSearch = true,
  hasToolbar = true,
  dropdownCount = 1,
}: AdminPageSkeletonProps) {
  if (variant === "dashboard") {
    return <DashboardSkeleton />;
  }

  if (variant === "analytics") {
    return <AnalyticsSkeleton />;
  }

  if (variant === "sandbox") {
    return <AiSandboxSkeleton />;
  }

  if (variant === "system-health") {
    return <SystemHealthSkeleton />;
  }

  if (variant === "subscriptions") {
    return <SubscriptionsSkeleton />;
  }

  if (variant === "broadcasts") {
    return <BroadcastsSkeleton />;
  }

  if (variant === "split-cards") {
    return <SplitCardsSkeleton />;
  }

  if (variant === "ai-usage") {
    return <AiUsageSkeleton />;
  }

  if (variant === "profile") {
    return <ProfileSkeleton />;
  }

  return (
    <TablePageSkeleton
      hasHeader={hasHeader}
      hasKpis={hasKpis}
      kpiCount={kpiCount}
      hasTable={hasTable}
      tableRows={tableRows}
      hasSearch={hasSearch}
      hasToolbar={hasToolbar}
      dropdownCount={dropdownCount}
    />
  );
}

/** Standard Table / List Page Skeleton */
function TablePageSkeleton({
  hasHeader = true,
  hasKpis = false,
  kpiCount = 4,
  hasTable = true,
  tableRows = 6,
  hasSearch = true,
  hasToolbar = true,
  dropdownCount = 1,
}: {
  hasHeader?: boolean;
  hasKpis?: boolean;
  kpiCount?: number;
  hasTable?: boolean;
  tableRows?: number;
  hasSearch?: boolean;
  hasToolbar?: boolean;
  dropdownCount?: number;
}) {
  const getGridColsClass = () => {
    if (kpiCount === 1) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    if (kpiCount === 2) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    if (kpiCount === 3) return "grid-cols-1 sm:grid-cols-3";
    return "grid-cols-2 md:grid-cols-4";
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      {hasHeader && (
        <div className="space-y-2 pb-1">
          <div className="h-8 w-56 rounded-lg bg-muted/60 animate-pulse" />
          <div className="h-4 w-80 max-w-full rounded-md bg-muted/40 animate-pulse" />
        </div>
      )}

      {/* KPI Cards Skeleton */}
      {hasKpis && (
        <div className={`grid ${getGridColsClass()} dashboard-card-gap`}>
          {Array.from({ length: kpiCount }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-border/50 bg-card/40 p-5 flex flex-col justify-between"
            >
              <div className="h-3.5 w-24 rounded bg-muted/60 animate-pulse" />
              <div className="h-7 w-20 rounded bg-primary/20 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Table / Content Skeleton */}
      {hasTable && (
        <div className="rounded-xl border border-border/50 bg-card/40 p-5 space-y-4">
          {hasToolbar && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
              {hasSearch ? (
                <div className="h-10 w-full sm:w-72 rounded-lg bg-muted/50 animate-pulse" />
              ) : (
                <div className="h-5 w-48 rounded bg-muted/40 animate-pulse" />
              )}
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: dropdownCount }).map((_, d) => (
                  <div key={d} className="h-10 w-32 rounded-lg bg-muted/40 animate-pulse" />
                ))}
                <div className="h-10 w-28 rounded-lg bg-muted/40 animate-pulse" />
              </div>
            </div>
          )}

          {/* Table Header row */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 py-2 border-b border-border/30">
            <div className="h-4 w-24 rounded bg-muted/50 animate-pulse" />
            <div className="h-4 w-28 rounded bg-muted/50 animate-pulse" />
            <div className="h-4 w-20 rounded bg-muted/50 animate-pulse hidden sm:block" />
            <div className="h-4 w-16 rounded bg-muted/50 animate-pulse" />
            <div className="h-4 w-20 rounded bg-muted/50 animate-pulse" />
          </div>

          {/* Table Rows */}
          <div className="space-y-3 pt-1">
            {Array.from({ length: tableRows }).map((_, row) => (
              <div
                key={row}
                className="flex items-center justify-between gap-4 h-14 rounded-lg bg-muted/20 px-4 border border-border/20"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-lg bg-muted/60 animate-pulse shrink-0" />
                  <div className="space-y-1.5 min-w-0">
                    <div className="h-3.5 w-32 rounded bg-muted/60 animate-pulse" />
                    <div className="h-2.5 w-24 rounded bg-muted/40 animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-20 rounded-full bg-primary/10 animate-pulse hidden sm:block" />
                <div className="h-4 w-16 rounded bg-muted/50 animate-pulse" />
                <div className="h-8 w-16 rounded-lg bg-muted/40 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Admin Home / Overview Dashboard Skeleton */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col dashboard-card-gap pb-4 animate-in fade-in duration-300">
      {/* Welcome Banner Skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-muted/30 via-muted/10 to-muted/30 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="h-7 w-64 rounded-lg bg-muted/70 animate-pulse" />
            <div className="h-4 w-96 max-w-full rounded-md bg-muted/40 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 w-28 rounded-xl bg-card/60 border border-border/40 p-2.5 flex flex-col justify-between">
                <div className="h-4 w-12 rounded bg-primary/20 animate-pulse" />
                <div className="h-2.5 w-16 rounded bg-muted/50 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI 8-card grid Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-44 rounded-lg bg-muted/60 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 dashboard-card-gap">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-border/50 bg-card/40 p-5 flex items-start gap-4"
            >
              <div className="size-12 rounded-xl bg-muted/60 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="h-3 w-20 rounded bg-muted/50 animate-pulse" />
                <div className="h-6 w-14 rounded bg-primary/20 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health + Recent Users Split Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 dashboard-card-gap">
        {/* System Health widget */}
        <div className="space-y-4">
          <div className="h-6 w-36 rounded-lg bg-muted/60 animate-pulse" />
          <div className="rounded-xl border border-border/50 bg-card/40 p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between pb-3 border-b border-border/30 last:border-0 last:pb-0">
                <div className="h-4 w-28 rounded bg-muted/50 animate-pulse" />
                <div className="h-6 w-16 rounded-full bg-emerald-500/15 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users widget */}
        <div className="space-y-4">
          <div className="h-6 w-36 rounded-lg bg-muted/60 animate-pulse" />
          <div className="rounded-xl border border-border/50 bg-card/40 divide-y divide-border/40 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="h-4 w-32 rounded bg-muted/60 animate-pulse" />
                  <div className="h-3 w-40 rounded bg-muted/40 animate-pulse" />
                </div>
                <div className="h-6 w-16 rounded-full bg-primary/10 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Stream Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-36 rounded-lg bg-muted/60 animate-pulse" />
          <div className="h-4 w-20 rounded bg-muted/40 animate-pulse" />
        </div>
        <div className="rounded-xl border border-border/50 bg-card/40 divide-y divide-border/40 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="size-9 rounded-full bg-primary/10 animate-pulse shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-4 w-36 rounded bg-muted/60 animate-pulse" />
                <div className="h-3 w-56 rounded bg-muted/40 animate-pulse" />
              </div>
              <div className="h-3 w-20 rounded bg-muted/40 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Platform Analytics Skeleton */
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Time Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-60 rounded-lg bg-muted/60 animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded-md bg-muted/40 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-16 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>

      {/* 4 GlowCard KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 dashboard-card-gap">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-border/50 bg-card/40 p-5 flex flex-col justify-between"
          >
            <div className="h-3.5 w-24 rounded bg-muted/60 animate-pulse" />
            <div className="h-8 w-20 rounded bg-primary/20 animate-pulse" />
          </div>
        ))}
      </div>

      {/* 2x2 Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 dashboard-card-gap">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-96 rounded-xl border border-border/50 bg-card/40 p-6 flex flex-col justify-between space-y-4"
          >
            <div className="h-5 w-44 rounded bg-muted/60 animate-pulse" />
            <div className="h-72 w-full rounded-lg bg-muted/20 border border-border/30 flex items-end p-4 gap-3">
              {Array.from({ length: 8 }).map((_, b) => (
                <div
                  key={b}
                  className="flex-1 rounded-t bg-primary/15 animate-pulse"
                  style={{ height: `${25 + ((b * 11) % 65)}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** AI Prompt & Sandbox Console Skeleton */
function AiSandboxSkeleton() {
  return (
    <div className="flex flex-col dashboard-card-gap pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-muted/60 animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded-md bg-muted/40 animate-pulse" />
      </div>

      {/* 12-col Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 dashboard-card-gap">
        {/* Left Column: Parameters (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-xl border border-border/50 bg-card/40 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="h-5 w-36 rounded bg-muted/60 animate-pulse" />
              <div className="h-4 w-16 rounded-full bg-primary/15 animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-3 w-28 rounded bg-muted/40 animate-pulse" />
                <div className="h-10 w-full rounded-lg bg-muted/30 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-32 rounded bg-muted/40 animate-pulse" />
                <div className="h-4 w-full rounded bg-muted/30 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-28 rounded bg-muted/40 animate-pulse" />
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, t) => (
                    <div key={t} className="h-8 rounded-lg bg-muted/30 animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-40 rounded bg-muted/40 animate-pulse" />
                <div className="h-24 w-full rounded-lg bg-muted/30 animate-pulse" />
              </div>
              <div className="h-4 w-24 rounded bg-muted/40 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Column: Console & Telemetry (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Prompt Console */}
          <div className="rounded-xl border border-border/50 bg-card/40 p-6 space-y-4">
            <div className="h-5 w-48 rounded bg-muted/60 animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, t) => (
                <div key={t} className="h-6 w-24 rounded-full bg-muted/30 animate-pulse" />
              ))}
            </div>
            <div className="h-28 w-full rounded-lg bg-muted/30 animate-pulse" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 w-32 rounded bg-muted/40 animate-pulse" />
              <div className="h-10 w-36 rounded-lg bg-primary/20 animate-pulse" />
            </div>
          </div>

          {/* Telemetry & Output */}
          <div className="rounded-xl border border-border/50 bg-card/40 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="h-5 w-48 rounded bg-muted/60 animate-pulse" />
              <div className="h-8 w-24 rounded-lg bg-muted/30 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, s) => (
                <div key={s} className="h-14 rounded-lg bg-muted/20 p-2.5 space-y-1">
                  <div className="h-2.5 w-16 rounded bg-muted/40 animate-pulse" />
                  <div className="h-4 w-12 rounded bg-primary/20 animate-pulse" />
                </div>
              ))}
            </div>
            <div className="h-40 w-full rounded-xl bg-muted/20 border border-border/40 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** System Health Telemetry Skeleton */
function SystemHealthSkeleton() {
  return (
    <div className="flex flex-col dashboard-card-gap pb-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-muted/60 animate-pulse" />
        <div className="h-4 w-80 max-w-full rounded-md bg-muted/40 animate-pulse" />
      </div>

      {/* Live Status Banner */}
      <div className="rounded-xl border border-border/50 bg-card/40 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-green-500/15 animate-pulse shrink-0" />
          <div className="space-y-2">
            <div className="h-6 w-56 rounded bg-muted/60 animate-pulse" />
            <div className="h-3.5 w-96 max-w-full rounded bg-muted/40 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="h-10 w-24 rounded bg-muted/30 animate-pulse" />
          <div className="h-10 w-28 rounded bg-muted/30 animate-pulse" />
          <div className="h-10 w-24 rounded-lg bg-muted/40 animate-pulse" />
        </div>
      </div>

      {/* 4 Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 dashboard-card-gap">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-xl border border-border/50 bg-card/40 p-5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="size-12 rounded-xl bg-primary/10 animate-pulse" />
              <div className="h-6 w-24 rounded-full bg-green-500/15 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-muted/60 animate-pulse" />
              <div className="h-3 w-20 rounded bg-primary/20 animate-pulse" />
              <div className="h-3 w-48 rounded bg-muted/40 animate-pulse" />
            </div>
            <div className="pt-3 border-t border-border/30 space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded bg-muted/40 animate-pulse" />
                <div className="h-3 w-12 rounded bg-muted/50 animate-pulse" />
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                <div className="h-full w-3/4 rounded-full bg-green-500/30 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2 Diagnostic Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 dashboard-card-gap">
        <div className="rounded-xl border border-border/50 bg-card/40 p-6 space-y-4">
          <div className="h-5 w-44 rounded bg-muted/60 animate-pulse" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, r) => (
              <div key={r} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-28 rounded bg-muted/50 animate-pulse" />
                  <div className="h-3 w-12 rounded bg-muted/40 animate-pulse" />
                </div>
                <div className="h-2 w-full rounded-full bg-muted/30 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/40 p-6 space-y-4">
          <div className="h-5 w-44 rounded bg-muted/60 animate-pulse" />
          <div className="divide-y divide-border/30">
            {Array.from({ length: 4 }).map((_, r) => (
              <div key={r} className="py-3 flex justify-between">
                <div className="h-3.5 w-32 rounded bg-muted/50 animate-pulse" />
                <div className="h-3.5 w-40 rounded bg-muted/40 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Subscriptions & Pricing Skeleton */
function SubscriptionsSkeleton() {
  return (
    <div className="flex flex-col dashboard-card-gap pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-60 rounded-lg bg-muted/60 animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded-md bg-muted/40 animate-pulse" />
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-border/50 bg-card/40 p-5 flex items-start gap-4"
          >
            <div className="size-12 rounded-xl bg-muted/60 animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-24 rounded bg-muted/50 animate-pulse" />
              <div className="h-6 w-20 rounded bg-primary/20 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* 3 Pricing Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card/40 p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="h-6 w-20 rounded-full bg-primary/15 animate-pulse" />
              <div className="h-4 w-16 rounded bg-muted/40 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-28 rounded bg-muted/60 animate-pulse" />
              <div className="h-8 w-24 rounded bg-foreground/15 animate-pulse" />
            </div>
            <div className="pt-4 border-t border-border/40 space-y-3">
              {Array.from({ length: 5 }).map((_, f) => (
                <div key={f} className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-emerald-500/20 animate-pulse shrink-0" />
                  <div className="h-3 w-44 rounded bg-muted/40 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Subscribers List */}
      <div className="rounded-xl border border-border/50 bg-card/40 divide-y divide-border/40 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-muted/60 animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded bg-muted/60 animate-pulse" />
                <div className="h-3 w-44 rounded bg-muted/40 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-20 rounded-full bg-primary/10 animate-pulse" />
              <div className="h-8 w-28 rounded-lg bg-muted/40 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Broadcast Announcements Skeleton */
function BroadcastsSkeleton() {
  return (
    <div className="flex flex-col dashboard-card-gap pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-muted/60 animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded-md bg-muted/40 animate-pulse" />
      </div>

      {/* 4 Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 dashboard-card-gap">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-border/50 bg-card/40 p-5 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 rounded bg-muted/50 animate-pulse" />
              <div className="size-8 rounded-lg bg-primary/10 animate-pulse" />
            </div>
            <div className="h-7 w-16 rounded bg-primary/20 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Composer & History 12-col */}
      <div className="grid grid-cols-1 lg:grid-cols-12 dashboard-card-gap">
        <div className="lg:col-span-5 rounded-xl border border-border/50 bg-card/40 p-6 space-y-4">
          <div className="h-5 w-40 rounded bg-muted/60 animate-pulse" />
          <div className="h-10 w-full rounded-lg bg-muted/30 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 rounded-lg bg-muted/30 animate-pulse" />
            <div className="h-10 rounded-lg bg-muted/30 animate-pulse" />
          </div>
          <div className="h-10 w-full rounded-lg bg-muted/30 animate-pulse" />
          <div className="h-28 w-full rounded-lg bg-muted/30 animate-pulse" />
          <div className="h-10 w-full rounded-lg bg-primary/20 animate-pulse" />
        </div>

        <div className="lg:col-span-7 rounded-xl border border-border/50 bg-card/40 p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border/40">
            <div className="h-5 w-48 rounded bg-muted/60 animate-pulse" />
            <div className="h-5 w-20 rounded-full bg-emerald-500/15 animate-pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/20 border border-border/30 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-36 rounded bg-muted/60 animate-pulse" />
                  <div className="h-4 w-20 rounded bg-muted/40 animate-pulse" />
                </div>
                <div className="h-3 w-full rounded bg-muted/30 animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-muted/30 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Split Cards (Skill Health) Skeleton */
function SplitCardsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-muted/60 animate-pulse" />
        <div className="h-4 w-80 max-w-full rounded-md bg-muted/40 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 dashboard-card-gap">
        {/* Strong Skills */}
        <div className="rounded-xl border border-border/50 bg-card/40 divide-y divide-border/40 overflow-hidden">
          <div className="p-4 flex items-center gap-2 border-b border-border/40 bg-muted/20">
            <div className="size-4 rounded-full bg-green-500/20 animate-pulse" />
            <div className="h-4 w-28 rounded bg-muted/60 animate-pulse" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-green-500/10 animate-pulse shrink-0" />
                <div className="space-y-1">
                  <div className="h-4 w-28 rounded bg-muted/60 animate-pulse" />
                  <div className="h-3 w-16 rounded bg-muted/40 animate-pulse" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-4 w-12 rounded bg-foreground/15 animate-pulse ml-auto" />
                <div className="h-3 w-20 rounded bg-muted/40 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Weak Skills */}
        <div className="rounded-xl border border-border/50 bg-card/40 divide-y divide-border/40 overflow-hidden">
          <div className="p-4 flex items-center gap-2 border-b border-border/40 bg-muted/20">
            <div className="size-4 rounded-full bg-red-500/20 animate-pulse" />
            <div className="h-4 w-44 rounded bg-muted/60 animate-pulse" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-red-500/10 animate-pulse shrink-0" />
                <div className="space-y-1">
                  <div className="h-4 w-28 rounded bg-muted/60 animate-pulse" />
                  <div className="h-3 w-16 rounded bg-muted/40 animate-pulse" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-4 w-12 rounded bg-foreground/15 animate-pulse ml-auto" />
                <div className="h-3 w-20 rounded bg-muted/40 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** AI Usage Page Skeleton */
function AiUsageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-44 rounded-lg bg-muted/60 animate-pulse" />
        <div className="h-4 w-80 max-w-full rounded-md bg-muted/40 animate-pulse" />
      </div>

      {/* 3 KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 dashboard-card-gap">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-border/50 bg-card/40 p-5 flex flex-col justify-between"
          >
            <div className="h-3.5 w-24 rounded bg-muted/60 animate-pulse" />
            <div className="h-8 w-20 rounded bg-primary/20 animate-pulse" />
          </div>
        ))}
      </div>

      {/* 2 Provider Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 dashboard-card-gap">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/40 p-5 space-y-3">
            <div className="h-5 w-28 rounded bg-muted/60 animate-pulse" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded bg-muted/40 animate-pulse" />
                <div className="h-3 w-12 rounded bg-muted/50 animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded bg-muted/40 animate-pulse" />
                <div className="h-3 w-12 rounded bg-green-500/30 animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded bg-muted/40 animate-pulse" />
                <div className="h-3 w-12 rounded bg-red-500/30 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-border/50 bg-card/40 p-5 space-y-4">
        <div className="h-10 w-full sm:w-72 rounded-lg bg-muted/40 animate-pulse" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, r) => (
            <div key={r} className="h-12 w-full rounded-lg bg-muted/20 animate-pulse border border-border/20" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Admin Profile & Operations Hub Skeleton */
function ProfileSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 pb-6">
      {/* Cover and Avatar Skeleton */}
      <div className="rounded-2xl border border-border/50 bg-card/40 overflow-hidden">
        <div className="h-48 md:h-64 w-full bg-muted/40 animate-pulse" />
        <div className="px-6 pb-6 -mt-16 md:-mt-20 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="size-32 md:size-40 rounded-full ring-4 ring-card bg-muted/60 animate-pulse shrink-0" />
          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="h-6 w-48 rounded bg-muted/60 animate-pulse mx-auto md:mx-0" />
            <div className="h-4 w-72 rounded bg-muted/40 animate-pulse mx-auto md:mx-0" />
          </div>
        </div>
      </div>

      {/* 2-Column Split Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 dashboard-card-gap">
        <div className="space-y-6">
          <div className="rounded-xl border border-border/50 bg-card/40 p-6 space-y-4">
            <div className="h-5 w-36 rounded bg-muted/60 animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-muted/20 border border-border/30 animate-pulse" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/40 p-6 space-y-4">
            <div className="h-5 w-36 rounded bg-muted/60 animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-muted/20 border border-border/30 animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border/50 bg-card/40 p-6 space-y-4">
            <div className="h-5 w-36 rounded bg-muted/60 animate-pulse" />
            <div className="h-64 rounded-xl bg-muted/20 border border-border/30 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 6-Card Operations Hub */}
      <div className="space-y-4 pt-2">
        <div className="h-6 w-56 rounded bg-muted/60 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 dashboard-card-gap">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl border border-border/50 bg-card/40 p-4 flex flex-col justify-between">
              <div className="size-10 rounded-xl bg-primary/10 animate-pulse" />
              <div className="space-y-1">
                <div className="h-3.5 w-24 rounded bg-muted/60 animate-pulse" />
                <div className="h-2.5 w-28 rounded bg-muted/40 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
