"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";
import {
  getAdminInterviews,
  getAdminInterviewDetails,
  AdminInterviewSessionItem,
} from "@/src/lib/api/admin/interviews";
import {
  Mic,
  CheckCircle2,
  Clock,
  Award,
  Eye,
  User,
  Sparkles,
} from "lucide-react";
import { useDebounce } from "use-debounce";
import { Avatar, Modal, Button, Select, Label, ListBox, useOverlayState } from "@heroui/react";
import type { Key } from "@heroui/react";
import AdminPageSkeleton from "../shared/AdminPageSkeleton";
import AdminDataTable, { AdminDataTableColumn } from "../shared/AdminDataTable";
import { Card, CardContent } from "@/src/components/ui/Card";

const glowCardClass =
  "group relative overflow-hidden rounded-xl p-6 transition-all duration-300 border-2 border-background shadow-none proof-card";

export default function AdminInterviewsView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Key | null>(null);
  const [daysFilter, setDaysFilter] = useState<Key | null>(null);
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const take = 10;
  const skip = (page - 1) * take;

  const inspectModal = useOverlayState();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "adminInterviews",
      userId,
      skip,
      take,
      debouncedSearch,
      statusFilter,
      daysFilter,
    ],
    queryFn: () =>
      getAdminInterviews(
        userId!,
        skip,
        take,
        debouncedSearch,
        statusFilter ? String(statusFilter) : "",
        daysFilter ? Number(daysFilter) : undefined
      ),
    enabled: !!userId,
  });

  const { data: sessionDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["adminInterviewDetails", userId, selectedSessionId],
    queryFn: () => getAdminInterviewDetails(userId!, selectedSessionId!),
    enabled: !!userId && !!selectedSessionId && inspectModal.isOpen,
  });

  const handleInspect = (id: string) => {
    setSelectedSessionId(id);
    inspectModal.open();
  };

  if (isLoading && !data) {
    return (
      <AdminPageSkeleton
        variant="table"
        hasKpis={true}
        kpiCount={4}
        hasSearch={true}
        hasToolbar={true}
        dropdownCount={2}
      />
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load interviews. Please try again.</p>
      </div>
    );
  }

  const { interviews, total, summary } = data;

  const kpis = [
    {
      title: "Total Sessions",
      value: summary.totalSessions,
      icon: Mic,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Completed",
      value: summary.completedSessions,
      icon: CheckCircle2,
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      title: "In Progress",
      value: summary.inProgressSessions,
      icon: Clock,
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "Avg Performance",
      value: `${summary.averageScore}%`,
      icon: Award,
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  const columns: AdminDataTableColumn<AdminInterviewSessionItem>[] = [
    {
      header: "Learner",
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <Avatar.Image src={item.user.image ?? undefined} alt={item.user.name} />
            <Avatar.Fallback>
              <User className="size-4" />
            </Avatar.Fallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">{item.user.name}</span>
              {item.user.plan && (
                <span className="rounded bg-muted/60 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {item.user.plan}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{item.user.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Target Role",
      render: (item) => (
        <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 max-w-[170px] truncate">
          {item.targetRole || "General Technical"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            item.status === "COMPLETED"
              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
              : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
          }`}
        >
          {item.status === "COMPLETED" ? (
            <CheckCircle2 className="size-3" />
          ) : (
            <Clock className="size-3" />
          )}
          {item.status}
        </span>
      ),
    },
    {
      header: "Score",
      render: (item) => {
        const score = item.score ?? 0;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
              score >= 80
                ? "bg-green-500/10 text-green-500"
                : score >= 50
                  ? "bg-orange-500/10 text-orange-500"
                  : "bg-red-500/10 text-red-500"
            }`}
          >
            {item.status === "COMPLETED" ? `${score}%` : "Pending"}
          </span>
        );
      },
    },
    {
      header: "Q&A Count",
      render: (item) => (
        <span className="text-xs text-muted-foreground font-mono">
          {item._count.answers} / {item._count.questions} questions
        </span>
      ),
    },
    {
      header: "Started",
      render: (item) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(item.startedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Action",
      render: (item) => (
        <button
          onClick={() => handleInspect(item.id)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          title="Inspect Responses & AI Feedback"
        >
          <Eye className="size-3.5" /> Inspect
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col dashboard-card-gap pb-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="section-title text-left">
          Mock Interviews <span className="text-brand">Supervision</span>
        </h1>
        <p className="section-subtitle mt-1 text-left">
          Monitor learner interview performances, voice/text dialogues, questions asked, and AI evaluation metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} mouseGlow className={glowCardClass}>
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
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* DataTable */}
      <AdminDataTable
        columns={columns}
        rows={interviews}
        rowKey={(item) => item.id}
        emptyMessage="No interview sessions found matching your criteria."
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        searchPlaceholder="Search by role or learner name/email..."
        toolbar={
          <>
            <Select
              className="w-full sm:w-40"
              placeholder="All Statuses"
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <Label>Status</Label>
              <Select.Trigger className="rounded-lg! [border-radius:0.5rem]!">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item key="COMPLETED" id="COMPLETED" textValue="Completed">
                    Completed
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item key="IN_PROGRESS" id="IN_PROGRESS" textValue="In Progress">
                    In Progress
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>

            <Select
              className="w-full sm:w-40"
              placeholder="Any Time"
              value={daysFilter}
              onChange={(val) => {
                setDaysFilter(val);
                setPage(1);
              }}
            >
              <Label>Time Range</Label>
              <Select.Trigger className="rounded-lg! [border-radius:0.5rem]!">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item key="7" id="7" textValue="Last 7 Days">
                    Last 7 Days
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item key="30" id="30" textValue="Last 30 Days">
                    Last 30 Days
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item key="90" id="90" textValue="Last 90 Days">
                    Last 90 Days
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </>
        }
        page={page}
        take={take}
        total={total}
        onPageChange={setPage}
      />

      {/* Details Inspection Modal */}
      <Modal state={inspectModal}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-[720px] max-h-[90vh] flex flex-col">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Icon className="bg-primary/10 text-primary">
                  <Mic className="size-5" />
                </Modal.Icon>
                <Modal.Heading>
                  {sessionDetails?.targetRole || "Interview Session"} Performance
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="overflow-y-auto space-y-4">
                {isDetailsLoading || !sessionDetails ? (
                  <div className="space-y-4 py-4 animate-pulse">
                    <div className="h-16 w-full rounded-xl bg-muted/40 border border-border/30" />
                    <div className="space-y-3 pt-2">
                      <div className="h-4 w-36 rounded bg-muted/50" />
                      <div className="h-28 w-full rounded-xl bg-muted/30 border border-border/30" />
                      <div className="h-28 w-full rounded-xl bg-muted/30 border border-border/30" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Candidate & Session Info */}
                    <div className="flex items-center justify-between rounded-xl bg-muted/40 p-4 border border-border/40">
                      <div>
                        <p className="font-semibold text-foreground">
                          {sessionDetails.user.name} ({sessionDetails.user.email})
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Started: {new Date(sessionDetails.startedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">Session Score</span>
                        <p className="text-2xl font-bold text-foreground">
                          {sessionDetails.score ?? 0}%
                        </p>
                      </div>
                    </div>

                    {/* Questions & Answers */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Dialogue & Evaluation ({sessionDetails.answers.length} recorded answers)
                      </h4>

                      {sessionDetails.answers.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          No answers recorded yet for this session.
                        </p>
                      ) : (
                        sessionDetails.answers.map((ans, idx) => (
                          <div
                            key={ans.id}
                            className="rounded-xl border border-border/50 bg-card p-4 space-y-3"
                          >
                            <div className="flex items-start gap-2">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                Q{idx + 1}
                              </span>
                              <p className="text-sm font-semibold text-foreground">
                                {ans.question?.question || "Interview Question"}
                              </p>
                            </div>

                            <div className="rounded-lg bg-muted/30 p-3 border border-border/30">
                              <p className="text-xs font-semibold text-muted-foreground mb-1">
                                Candidate Answer:
                              </p>
                              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                                {ans.answerText}
                              </p>
                            </div>

                            {ans.evaluation && (
                              <div className="rounded-lg bg-primary/5 p-3 border border-primary/20 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                                    <Sparkles className="size-3" /> AI Evaluation
                                  </span>
                                  {ans.evaluation.score !== undefined && (
                                    <span className="text-xs font-bold text-foreground">
                                      Score: {ans.evaluation.score}%
                                    </span>
                                  )}
                                </div>
                                {ans.evaluation.feedback && (
                                  <p className="text-xs text-muted-foreground">
                                    {ans.evaluation.feedback}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" slot="close" fullWidth>
                  Close
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
