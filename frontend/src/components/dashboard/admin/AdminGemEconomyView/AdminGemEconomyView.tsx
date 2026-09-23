"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";
import { useDebounce } from "use-debounce";
import {
  getAdminGemEconomyOverview,
  getAdminGemTransactions,
  adjustAdminUserGems,
  getAdminAtRiskLearners,
  sendAdminRecoveryReminder,
  searchAdminLearnersForGems,
  type AdminGemTransactionItem,
  type GemSearchLearnerItem,
} from "@/src/lib/api/admin/gem-economy";
import AdminPageSkeleton from "@/src/components/dashboard/admin/shared/AdminPageSkeleton";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";
import { showToast } from "@/src/components/ui/toast";
import {
  Sparkles,
  Flame,
  AlertTriangle,
  Send,
  History,
  Coins,
  RefreshCw,
  PlusCircle,
  Clock,
  ShieldCheck,
  X,
  Loader2,
  Search,
} from "lucide-react";
import "../admin.css";

export default function AdminGemEconomyView() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const adminUserId = session?.user?.id;

  const [activeTab, setActiveTab] = useState<"transactions" | "atRisk">("transactions");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 400);
  const [page, setPage] = useState(1);
  const take = 15;

  // At-Risk Search State
  const [atRiskSearch, setAtRiskSearch] = useState("");
  const [debouncedAtRiskSearch] = useDebounce(atRiskSearch, 350);

  // Manual Adjustment Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const [adjustAmount, setAdjustAmount] = useState<number>(20);
  const [adjustReason, setAdjustReason] = useState("");
  const [selectedLearner, setSelectedLearner] = useState<GemSearchLearnerItem | null>(null);

  // Live Learner Search for Modal
  const [learnerSearchInput, setLearnerSearchInput] = useState("");
  const [debouncedLearnerSearch] = useDebounce(learnerSearchInput, 300);

  const { data: searchResults, isFetching: isSearchingLearners } = useQuery({
    queryKey: ["adminSearchLearners", adminUserId, debouncedLearnerSearch],
    queryFn: () => searchAdminLearnersForGems(adminUserId!, debouncedLearnerSearch),
    enabled: !!adminUserId && isAdjustModalOpen && debouncedLearnerSearch.trim().length >= 1,
  });

  // 1. Overview Statistics Query
  const {
    data: overview,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ["adminGemOverview", adminUserId],
    queryFn: () => getAdminGemEconomyOverview(adminUserId!),
    enabled: !!adminUserId,
    refetchInterval: 10000,
  });

  // 2. Transactions Query
  const {
    data: txData,
    refetch: refetchTx,
  } = useQuery({
    queryKey: ["adminGemTransactions", adminUserId, page, debouncedSearch],
    queryFn: () =>
      getAdminGemTransactions(adminUserId!, take, (page - 1) * take, debouncedSearch),
    enabled: !!adminUserId && activeTab === "transactions",
  });

  // 3. At-Risk Learners Query
  const {
    data: atRiskLearners,
    isLoading: isAtRiskLoading,
    refetch: refetchAtRisk,
  } = useQuery({
    queryKey: ["adminAtRiskLearners", adminUserId, debouncedAtRiskSearch],
    queryFn: () => getAdminAtRiskLearners(adminUserId!, 50, 0, debouncedAtRiskSearch),
    enabled: !!adminUserId && activeTab === "atRisk",
  });

  // 4. Adjust Gems Mutation
  const adjustMutation = useMutation({
    mutationFn: (payload: { targetUserId: string; amount: number; reason?: string }) =>
      adjustAdminUserGems(adminUserId!, payload),
    onSuccess: (res) => {
      showToast({ message: res.message || "Gems adjusted successfully!", variant: "success" });
      setIsAdjustModalOpen(false);
      setTargetUserId("");
      setAdjustReason("");
      setSelectedLearner(null);
      setLearnerSearchInput("");
      queryClient.invalidateQueries({ queryKey: ["adminGemOverview"] });
      queryClient.invalidateQueries({ queryKey: ["adminGemTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (err: Error) => {
      showToast({ message: err.message || "Failed to adjust gems", variant: "error" });
    },
  });

  // 5. Send Recovery Reminder Mutation
  const reminderMutation = useMutation({
    mutationFn: (targetId: string) => sendAdminRecoveryReminder(adminUserId!, targetId),
    onSuccess: (res) => {
      showToast({ message: res.message || "Encouragement sent!", variant: "success" });
    },
    onError: (err: Error) => {
      showToast({ message: err.message || "Failed to send reminder", variant: "error" });
    },
  });

  if (isOverviewLoading && !overview) {
    return <AdminPageSkeleton />;
  }

  const transactionColumns: AdminDataTableColumn<AdminGemTransactionItem>[] = [
    {
      header: "Learner",
      render: (t) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
            {t.userName.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <div className="font-semibold text-foreground text-xs truncate">{t.userName}</div>
            <div className="text-xs text-muted-foreground truncate">{t.userEmail}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Amount",
      align: "center",
      render: (t) => (
        <span
          className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded-full ${
            t.amount >= 0
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
          }`}
        >
          {t.amount >= 0 ? `+${t.amount}` : t.amount} 💎
        </span>
      ),
    },
    {
      header: "Source",
      align: "center",
      render: (t) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-muted text-foreground border border-border/60">
          {t.source.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Description",
      render: (t) => (
        <span className="text-xs text-muted-foreground truncate max-w-[280px] block" title={t.description}>
          {t.description}
        </span>
      ),
    },
    {
      header: "Balance After",
      align: "center",
      render: (t) => (
        <span className="text-xs font-semibold text-foreground">
          {t.balanceAfter} 💎
        </span>
      ),
    },
    {
      header: "Date",
      align: "center",
      render: (t) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(t.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      header: "Action",
      align: "right",
      render: (t) => (
        <button
          type="button"
          onClick={() => {
            setTargetUserId(t.userEmail || t.userId);
            setSelectedLearner({
              id: t.userId,
              name: t.userName,
              email: t.userEmail,
              image: t.userImage,
              gemsBalance: t.balanceAfter,
            });
            setIsAdjustModalOpen(true);
          }}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted hover:bg-emerald-500/10 hover:text-emerald-500 border border-border transition-colors cursor-pointer"
        >
          Adjust
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-start sm:items-center gap-2.5">
            <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 shadow-xs mt-0.5 sm:mt-0">
              <Sparkles className="size-4 sm:size-5" />
            </div>
            <span className="leading-tight">AI Gem Economy & Streaks Manager</span>
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1.5 sm:mt-1 leading-relaxed">
            Real-time platform treasury monitoring, streak participation, and learner drop-off recovery
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              refetchOverview();
              if (activeTab === "transactions") refetchTx();
              if (activeTab === "atRisk") refetchAtRisk();
            }}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl bg-muted/60 hover:bg-muted active:scale-[0.98] text-foreground text-xs font-semibold transition-all border border-border cursor-pointer shadow-xs"
          >
            <RefreshCw className="size-3.5" />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdjustModalOpen(true)}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 hover:shadow-emerald-500/30 cursor-pointer"
          >
            <PlusCircle className="size-4" />
            <span className="whitespace-nowrap">Award / Adjust Gems</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Circulation</span>
            <Coins className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">{overview?.totalGemsInCirculation ?? 0}</span>
            <span className="text-xs font-bold text-emerald-500">💎</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total gems held across learners</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Claims (24h)</span>
            <Flame className="size-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">{overview?.claimsPast24h ?? 0}</span>
            <span className="text-xs font-semibold text-muted-foreground">claims</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Daily streak check-ins today</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Streakers</span>
            <ShieldCheck className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">{overview?.activeStreakersCount ?? 0}</span>
            <span className="text-xs font-semibold text-muted-foreground">learners</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Streak unbroken in past 48h</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Ledger Records</span>
            <History className="size-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">{overview?.totalTransactionsCount ?? 0}</span>
            <span className="text-xs font-semibold text-muted-foreground">txs</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Audit-verified reward events</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">At-Risk Learners</span>
            <AlertTriangle className="size-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{overview?.atRiskLearnersCount ?? 0}</span>
            <span className="text-xs font-semibold text-muted-foreground">inactive 7d+</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Eligible for Zero-Guilt Recovery</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "transactions"
              ? "bg-primary text-white shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <History className="size-3.5" />
          <span>Live Ledger Audit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("atRisk")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "atRisk"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <AlertTriangle className="size-3.5" />
          <span>At-Risk & Recovery Pipeline ({overview?.atRiskLearnersCount ?? 0})</span>
        </button>
      </div>

      {/* Tab Content: Transactions Ledger */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          <AdminDataTable<AdminGemTransactionItem>
            columns={transactionColumns}
            rows={txData?.transactions ?? []}
            rowKey={(t) => t.id}
            total={txData?.total ?? 0}
            take={take}
            page={page}
            onPageChange={setPage}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by learner name, email, or source..."
            emptyMessage="No gem transactions recorded yet."
          />
        </div>
      )}

      {/* Tab Content: At-Risk & Recovery Pipeline */}
      {activeTab === "atRisk" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-rose-500" />
              Inactivity & Zero-Guilt Recovery Telemetry
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Learners below have not engaged in roadmap milestones, interviews, or assessments for 7 or more days. You can monitor their recovery status or trigger an encouraging comeback notification directly from this dashboard.
            </p>
          </div>

          {/* At-Risk Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={atRiskSearch}
              onChange={(e) => setAtRiskSearch(e.target.value)}
              placeholder="Search across all inactive learners by name or email..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/30 shadow-xs"
            />
          </div>

          {isAtRiskLoading ? (
            <AdminPageSkeleton />
          ) : !atRiskLearners || atRiskLearners.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card">
              <ShieldCheck className="size-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <h4 className="font-bold text-foreground text-sm">
                {debouncedAtRiskSearch ? "No inactive learners matching search." : "Great engagement!"}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {debouncedAtRiskSearch
                  ? "Try searching with a different name or email."
                  : "No learners currently in the 7+ day drop-off danger zone."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {atRiskLearners.map((learner) => (
                <div
                  key={learner.userId}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-border/80 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="size-9 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {learner.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-foreground text-xs truncate">{learner.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{learner.email}</p>
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      {learner.daysInactive}d inactive
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Target Role:</span>
                      <span className="font-semibold text-foreground truncate max-w-[140px]">{learner.targetRole}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Gems Wallet:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{learner.gemsBalance} 💎</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Recovery Mode:</span>
                      <span
                        className={`font-semibold ${
                          learner.isInRecovery
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-500"
                        }`}
                      >
                        {learner.isInRecovery ? "Active Catch-Up" : "Eligible"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      disabled={reminderMutation.isPending}
                      onClick={() => reminderMutation.mutate(learner.userId)}
                      className="py-2 px-2.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="size-3" />
                      <span>Encourage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetUserId(learner.email || learner.userId);
                        setSelectedLearner({
                          id: learner.userId,
                          name: learner.name,
                          email: learner.email,
                          image: learner.image,
                          gemsBalance: learner.gemsBalance,
                        });
                        setAdjustAmount(25);
                        setAdjustReason("Comeback Welcome Bonus (+25 💎)");
                        setIsAdjustModalOpen(true);
                      }}
                      className="py-2 px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/20"
                    >
                      <Coins className="size-3" />
                      <span>Gift Gems</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual Gem Award Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Coins className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Award or Adjust Gems</h3>
                  <p className="text-xs text-muted-foreground">Search any learner by email or name to credit/adjust wallet.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAdjustModalOpen(false);
                  setSelectedLearner(null);
                  setTargetUserId("");
                }}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!targetUserId) {
                  showToast({ message: "Please search and select a learner, or enter their email/ID", variant: "error" });
                  return;
                }
                adjustMutation.mutate({
                  targetUserId,
                  amount: Number(adjustAmount),
                  reason: adjustReason,
                });
              }}
              className="space-y-3.5 pt-2"
            >
              {/* Learner Selection */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Target Learner (Search across 100k+ learners)
                </label>

                {selectedLearner ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0">
                        {selectedLearner.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-foreground text-xs truncate">{selectedLearner.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{selectedLearner.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedLearner.gemsBalance} 💎</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLearner(null);
                          setTargetUserId("");
                        }}
                        className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search by learner name, email, or paste user ID..."
                        value={learnerSearchInput || targetUserId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLearnerSearchInput(val);
                          setTargetUserId(val);
                        }}
                        className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      {isSearchingLearners && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 animate-spin text-muted-foreground" />
                      )}
                    </div>

                    {/* Autocomplete Dropdown */}
                    {searchResults && searchResults.length > 0 && !selectedLearner && (
                      <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg divide-y divide-border/50">
                        {searchResults.map((learner) => (
                          <button
                            key={learner.id}
                            type="button"
                            onClick={() => {
                              setSelectedLearner(learner);
                              setTargetUserId(learner.id);
                              setLearnerSearchInput("");
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/60 transition-colors text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className="size-7 rounded-md bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                                {learner.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="truncate">
                                <p className="font-semibold text-foreground text-xs truncate">{learner.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{learner.email}</p>
                              </div>
                            </div>
                            <span className="shrink-0 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {learner.gemsBalance} 💎
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Amount (Positive to Grant, Negative to Deduct)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    {[10, 25, 50, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAdjustAmount(preset)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-muted hover:bg-emerald-500/10 hover:text-emerald-500 border border-border transition-colors cursor-pointer"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Reason / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Hackathon winner bonus, Discord community reward..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdjustModalOpen(false);
                    setSelectedLearner(null);
                    setTargetUserId("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {adjustMutation.isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm Adjustment</span>
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
