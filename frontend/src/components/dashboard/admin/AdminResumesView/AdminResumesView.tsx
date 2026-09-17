"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";
import {
  getAdminResumes,
  getAdminResumeDetails,
  AdminResumeItem,
} from "@/src/lib/api/admin/resumes";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
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

export default function AdminResumesView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [daysFilter, setDaysFilter] = useState<Key | null>(null);
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const take = 10;
  const skip = (page - 1) * take;

  const inspectModal = useOverlayState();
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminResumes", userId, skip, take, debouncedSearch, daysFilter],
    queryFn: () =>
      getAdminResumes(
        userId!,
        skip,
        take,
        debouncedSearch,
        undefined,
        daysFilter ? Number(daysFilter) : undefined
      ),
    enabled: !!userId,
  });

  const { data: resumeDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["adminResumeDetails", userId, selectedResumeId],
    queryFn: () => getAdminResumeDetails(userId!, selectedResumeId!),
    enabled: !!userId && !!selectedResumeId && inspectModal.isOpen,
  });

  const handleInspect = (id: string) => {
    setSelectedResumeId(id);
    inspectModal.open();
  };

  if (isLoading && !data) {
    return (
      <AdminPageSkeleton
        variant="table"
        hasKpis={true}
        kpiCount={3}
        hasSearch={true}
        hasToolbar={true}
        dropdownCount={1}
      />
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load resumes. Please try again.</p>
      </div>
    );
  }

  const { resumes, total, summary } = data;

  const kpis = [
    {
      title: "Resumes Built",
      value: summary.totalResumes,
      icon: FileText,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Average ATS Score",
      value: `${summary.averageAtsScore}%`,
      icon: Award,
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "ATS Ready (80%+)",
      value: summary.highAtsCount,
      icon: CheckCircle2,
      color: "bg-emerald-500/10 text-emerald-500",
    },
  ];

  const columns: AdminDataTableColumn<AdminResumeItem>[] = [
    {
      header: "Candidate",
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <Avatar.Image src={item.user.image ?? undefined} alt={item.fullName} />
            <Avatar.Fallback>
              <User className="size-4" />
            </Avatar.Fallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">{item.fullName}</span>
              {item.user.plan && (
                <span className="rounded bg-muted/60 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {item.user.plan}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Target Role",
      render: (item) => (
        <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 max-w-[170px] truncate">
          {item.targetRole}
        </span>
      ),
    },
    {
      header: "ATS Score",
      render: (item) => {
        const score = item.atsScore ?? 0;
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
              score >= 80
                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                : score >= 60
                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                  : "bg-red-500/15 text-red-500 border border-red-500/30"
            }`}
          >
            <Sparkles className="size-3" />
            {score}%
          </span>
        );
      },
    },
    {
      header: "Sections",
      render: (item) => {
        const skillsLen = Array.isArray(item.skills) ? item.skills.length : 0;
        const expLen = Array.isArray(item.experience) ? item.experience.length : 0;
        const projLen = Array.isArray(item.projects) ? item.projects.length : 0;
        return (
          <span className="text-xs text-muted-foreground font-mono">
            {skillsLen} skills · {expLen} jobs · {projLen} projects
          </span>
        );
      },
    },
    {
      header: "Created",
      render: (item) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Action",
      render: (item) => (
        <button
          onClick={() => handleInspect(item.id)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          title="Inspect Resume & ATS Feedback"
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
          AI Resumes &amp; ATS <span className="text-brand">Intelligence</span>
        </h1>
        <p className="section-subtitle mt-1 text-left">
          Supervise learner resume creation, ATS scoring benchmarks, keyword match rates, and career preparation.
        </p>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        rows={resumes}
        rowKey={(item) => item.id}
        emptyMessage="No resumes found matching your criteria."
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        searchPlaceholder="Search by role, candidate name, or email..."
        toolbar={
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
        }
        page={page}
        take={take}
        total={total}
        onPageChange={setPage}
      />

      {/* Resume & ATS Details Inspection Modal */}
      <Modal state={inspectModal}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-[760px] max-h-[90vh] flex flex-col">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Icon className="bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </Modal.Icon>
                <Modal.Heading>
                  {resumeDetails?.fullName}&apos;s ATS Resume Review
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="overflow-y-auto space-y-5">
                {isDetailsLoading || !resumeDetails ? (
                  <div className="space-y-4 py-4 animate-pulse">
                    <div className="h-20 w-full rounded-xl bg-muted/40 border border-border/30" />
                    <div className="h-32 w-full rounded-xl bg-muted/30 border border-border/30" />
                    <div className="h-24 w-full rounded-xl bg-muted/30 border border-border/30" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* ATS Score Benchmark */}
                    <div className="flex items-center justify-between rounded-xl bg-muted/40 p-4 border border-border/40">
                      <div>
                        <p className="font-semibold text-foreground text-lg">
                          {resumeDetails.fullName}
                        </p>
                        <p className="text-xs text-primary font-medium mt-0.5">
                          Target Role: {resumeDetails.targetRole}
                        </p>
                        <p className="text-xs text-muted-foreground">{resumeDetails.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">ATS Score</span>
                        <p
                          className={`text-3xl font-extrabold ${
                            (resumeDetails.atsScore ?? 0) >= 80
                              ? "text-emerald-500"
                              : (resumeDetails.atsScore ?? 0) >= 60
                                ? "text-amber-500"
                                : "text-red-500"
                          }`}
                        >
                          {resumeDetails.atsScore ?? 0}%
                        </p>
                      </div>
                    </div>

                    {/* ATS Feedback Breakdown */}
                    {resumeDetails.atsFeedback && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <Sparkles className="size-4 text-primary" /> ATS Evaluation Insights
                        </h4>

                        {resumeDetails.atsFeedback.strengths &&
                          resumeDetails.atsFeedback.strengths.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-emerald-500 mb-1.5 flex items-center gap-1">
                                <CheckCircle2 className="size-3.5" /> Strengths Identified:
                              </p>
                              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                {resumeDetails.atsFeedback.strengths.map((str, i) => (
                                  <li key={i}>{str}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {resumeDetails.atsFeedback.missingKeywords &&
                          resumeDetails.atsFeedback.missingKeywords.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-amber-500 mb-1.5 flex items-center gap-1">
                                <AlertTriangle className="size-3.5" /> Missing Keywords For Target Role:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {resumeDetails.atsFeedback.missingKeywords.map((kw, i) => (
                                  <span
                                    key={i}
                                    className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-mono text-amber-600 dark:text-amber-400"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {resumeDetails.atsFeedback.suggestions &&
                          resumeDetails.atsFeedback.suggestions.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-primary mb-1.5">
                                Recommendations:
                              </p>
                              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                {resumeDetails.atsFeedback.suggestions.map((sug, i) => (
                                  <li key={i}>{sug}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    )}

                    {/* Resume Executive Summary */}
                    {resumeDetails.summary && (
                      <div className="rounded-xl border border-border/50 bg-card p-4 space-y-1.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Executive Summary
                        </h4>
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                          {resumeDetails.summary}
                        </p>
                      </div>
                    )}
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
