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
  X,
  Clock,
} from "lucide-react";
import { useDebounce } from "use-debounce";
import { Avatar, Modal, Button, Select, Label, ListBox, useOverlayState } from "@heroui/react";
import type { Key } from "@heroui/react";
import AdminPageSkeleton from "../shared/AdminPageSkeleton";
import AdminDataTable, { AdminDataTableColumn } from "../shared/AdminDataTable";
import { Card, CardContent } from "@/src/components/ui/Card";
import "../admin.css";

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
      align: "center",
      render: (item) => (
        <div className="flex justify-center">
          <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 max-w-[170px] truncate">
            {item.targetRole}
          </span>
        </div>
      ),
    },
    {
      header: "ATS Score",
      align: "center",
      render: (item) => {
        const score = item.atsScore ?? 0;
        return (
          <div className="flex justify-center">
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
          </div>
        );
      },
    },
    {
      header: "Sections",
      align: "center",
      render: (item) => {
        const skillsLen = Array.isArray(item.skills) ? item.skills.length : 0;
        const expLen = Array.isArray(item.experience) ? item.experience.length : 0;
        const projLen = Array.isArray(item.projects) ? item.projects.length : 0;
        return (
          <div className="flex justify-center text-center">
            <span className="text-xs text-muted-foreground font-mono">
              {skillsLen} skills · {expLen} jobs · {projLen} projects
            </span>
          </div>
        );
      },
    },
    {
      header: "Created",
      align: "center",
      render: (item) => (
        <div className="flex justify-center text-center">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      header: "Action",
      align: "center",
      render: (item) => (
        <div className="flex justify-center">
          <button
            onClick={() => handleInspect(item.id)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            title="Inspect Resume & ATS Feedback"
          >
            <Eye className="size-3.5" /> Inspect
          </button>
        </div>
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
        <p className="section-subtitle mt-1 !text-left !mx-0 max-w-none">
          Supervise learner resume creation, ATS scoring benchmarks, keyword match rates, and career preparation
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
            <Select.Trigger
              className="rounded-lg! [border-radius:0.5rem]! transition-none!"
              style={{ borderRadius: "0.5rem", transition: "none" }}
            >
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover
              className="rounded-lg! [border-radius:0.5rem]!"
              style={{ borderRadius: "0.5rem" }}
            >
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
        <Modal.Backdrop className="bg-black/60 backdrop-blur-sm">
          <Modal.Container>
            <Modal.Dialog
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              className="sm:max-w-[720px] max-h-[90vh] flex flex-col rounded-lg border border-border bg-card text-card-foreground shadow-2xl overflow-hidden relative"
            >
              <Modal.CloseTrigger className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-primary hover:bg-primary/90 text-white dark:text-black transition-all duration-200 cursor-pointer shadow-sm z-20">
                <X className="size-4" />
              </Modal.CloseTrigger>
              <Modal.Header className="border-b border-border/40 p-5 flex items-center gap-3.5 relative z-10">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <FileText className="size-5" />
                </div>
                <div>
                  <Modal.Heading className="text-lg font-bold text-foreground tracking-tight">
                    {resumeDetails?.fullName ? `${resumeDetails.fullName}'s` : "Candidate"}{" "}
                    <span className="text-brand">ATS Resume Review</span>
                  </Modal.Heading>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Detailed AI ATS scoring benchmarks and evaluation
                  </p>
                </div>
              </Modal.Header>
              <Modal.Body
                data-lenis-prevent="true"
                data-lenis-prevent-wheel="true"
                data-lenis-prevent-touch="true"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                className="overflow-y-auto overscroll-contain p-5 space-y-5 flex-1 min-h-0 [scrollbar-width:thin]"
              >
                {isDetailsLoading || !resumeDetails ? (
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
                    {/* Candidate & ATS Score Info */}
                    <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/5 via-muted/20 to-primary/5 p-4 border border-border/60">
                      <div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">
                          {resumeDetails.fullName}{" "}
                          <span className="text-xs text-muted-foreground font-normal">
                            ({resumeDetails.email})
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                          <User className="size-3.5 text-primary" /> Target Role:{" "}
                          <span className="text-foreground font-medium">{resumeDetails.targetRole}</span>
                        </p>
                      </div>
                      <div className="text-right pl-4 shrink-0">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ATS Score</span>
                        <p className="text-2xl font-black text-primary">
                          {resumeDetails.atsScore ?? 0}%
                        </p>
                      </div>
                    </div>

                    {/* ATS Feedback Breakdown */}
                    {resumeDetails.atsFeedback && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pt-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Evaluation Insights &amp; Keywords
                          </h4>
                        </div>

                        <div className="rounded-xl border border-border/60 bg-card/60 dark:bg-card/40 p-4 space-y-3.5 hover:border-primary/30 transition-colors shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                              <Sparkles className="size-3.5" /> ATS Evaluation Insights
                            </span>
                            {resumeDetails.atsScore !== undefined && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30">
                                Score: {resumeDetails.atsScore}%
                              </span>
                            )}
                          </div>

                          {resumeDetails.atsFeedback.strengths &&
                            resumeDetails.atsFeedback.strengths.length > 0 && (
                              <div className="rounded-lg bg-muted/40 dark:bg-muted/20 p-3.5 border border-border/40 space-y-1.5">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                  <CheckCircle2 className="size-3.5" /> Strengths Identified:
                                </p>
                                <ul className="list-disc list-inside text-xs text-foreground/90 space-y-1 leading-relaxed">
                                  {resumeDetails.atsFeedback.strengths.map((str, i) => (
                                    <li key={i}>{str}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          {resumeDetails.atsFeedback.missingKeywords &&
                            resumeDetails.atsFeedback.missingKeywords.length > 0 && (
                              <div className="rounded-lg bg-amber-500/5 dark:bg-amber-500/10 p-3.5 border border-amber-500/20 space-y-2">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                  <AlertTriangle className="size-3.5" /> Missing Keywords For Target Role:
                                </p>
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                  {resumeDetails.atsFeedback.missingKeywords.map((kw, i) => (
                                    <span
                                      key={i}
                                      className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-mono text-amber-600 dark:text-amber-400 font-medium"
                                    >
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          {resumeDetails.atsFeedback.suggestions &&
                            resumeDetails.atsFeedback.suggestions.length > 0 && (
                              <div className="rounded-lg bg-primary/5 dark:bg-primary/10 p-3.5 border border-primary/20 space-y-1.5">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                  Recommendations:
                                </p>
                                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 leading-relaxed">
                                  {resumeDetails.atsFeedback.suggestions.map((sug, i) => (
                                    <li key={i}>{sug}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Resume Executive Summary */}
                    {resumeDetails.summary && (
                      <div className="rounded-xl border border-border/60 bg-muted/40 dark:bg-muted/20 p-4 space-y-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
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
              <Modal.Footer className="border-t border-border/40 p-4 bg-muted/10">
                <Button
                  slot="close"
                  fullWidth
                  className="rounded-lg font-semibold py-2.5 text-sm transition-all duration-200 !bg-primary hover:!bg-primary/90 !text-white dark:!text-black shadow-sm cursor-pointer"
                >
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
