"use client";
import {
  PageHeader,
  DashboardButton,
} from "@/src/components/dashboard/shared/patterns";

import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import {
  getPortfolio,
  createProject,
  importProject,
  updateProject,
  deleteProject,
  generateProjectReview,
  reanalyzeProject,
  verifyProjectUrls,
  reviewProjectPullRequest,
  generateMilestoneProject,
  ProjectData,
} from "@/src/lib/api/learner/portfolio";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import GenericPageSkeleton from "../../../shared/GenericPageSkeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/Card";
import { DashboardCard } from "@/src/components/dashboard/shared/cards";
import {
  FolderGit2,
  ExternalLink,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Star,
  Loader2,
  Trash2,
  Edit2,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
  ShieldCheck,
  ArrowRight,
  Code2,
} from "lucide-react";

export default function PortfolioPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<
    Record<string, boolean>
  >({});
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "GENERATED" | "IMPORTED"
  >("ALL");
  const [generatedProjectSpec, setGeneratedProjectSpec] = useState<{
    project: ProjectData;
    duplicate: boolean;
  } | null>(null);
  const [generateErrorMsg, setGenerateErrorMsg] = useState<string | null>(null);

  const [prModalProject, setPrModalProject] = useState<{
    id: string;
    name: string;
    repoUrl?: string | null;
  } | null>(null);
  const [prUrlInput, setPrUrlInput] = useState("");
  const [prReviewData, setPrReviewData] = useState<{
    prSummary?: string;
    qualityScore?: number;
    verdict?: string;
    positives?: string[];
    concerns?: string[];
    actionableSuggestions?: string[];
  } | null>(null);
  const [prReviewError, setPrReviewError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    repositoryUrl: "",
    liveUrl: "",
  });

  const [importFormData, setImportFormData] = useState({
    repositoryUrl: "",
    liveUrl: "",
    title: "",
    description: "",
    techStack: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [importErrorMsg, setImportErrorMsg] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["portfolio", session?.user?.id],
    queryFn: () => getPortfolio(),
    enabled: !!session?.user?.id,
  });

  const generateAiProjectMut = useMutation({
    mutationFn: () => generateMilestoneProject(null, null),
    onSuccess: (resData) => {
      setGenerateErrorMsg(null);
      const proj = resData.project || resData.data;
      if (proj) {
        setGeneratedProjectSpec({
          project: proj,
          duplicate: !!resData.duplicate,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["portfolio", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["careerTwin", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardData", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["proofGraph", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["skillGaps", session?.user?.id],
      });
    },
    onError: (err: Error) => {
      setGenerateErrorMsg(
        err.message || "Failed to generate AI project. Please try again.",
      );
    },
  });

  const createMut = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["portfolio", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["careerTwin", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardData", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["proofGraph", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["skillGaps", session?.user?.id],
      });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: Error) =>
      setErrorMsg(err.message || "Failed to create project"),
  });

  const importMut = useMutation({
    mutationFn: importProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["portfolio", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["careerTwin", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardData", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["proofGraph", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["skillGaps", session?.user?.id],
      });
      setIsImportModalOpen(false);
      resetImportForm();
    },
    onError: (err: Error) =>
      setImportErrorMsg(err.message || "Failed to import GitHub project"),
  });

  const updateMut = useMutation({
    mutationFn: (vars: { id: string; data: Record<string, unknown> }) =>
      updateProject(vars.id, vars.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["portfolio", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["careerTwin", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardData", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["proofGraph", session?.user?.id],
      });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: Error) =>
      setErrorMsg(err.message || "Failed to update project"),
  });

  const [deletingProject, setDeletingProject] = useState<ProjectData | null>(
    null,
  );
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  const deleteMut = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["portfolio", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["careerTwin", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardData", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["proofGraph", session?.user?.id],
      });
      setDeletingProject(null);
      setDeleteErrorMsg(null);
    },
    onError: (err: Error) => {
      setDeleteErrorMsg(
        err.message || "Failed to delete project. Please try again.",
      );
    },
  });

  const reviewMut = useMutation({
    mutationFn: generateProjectReview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["portfolio", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["careerTwin", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardData", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["proofGraph", session?.user?.id],
      });
    },
    onError: (err: Error) => alert(err.message || "Unable to review project."),
  });

  const reanalyzeMut = useMutation({
    mutationFn: reanalyzeProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["portfolio", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["careerTwin", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardData", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["proofGraph", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["skillGaps", session?.user?.id],
      });
    },
    onError: (err: Error) =>
      alert(err.message || "Failed to re-analyze project."),
  });

  const verifyMut = useMutation({
    mutationFn: verifyProjectUrls,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["portfolio", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["careerTwin", session?.user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardData", session?.user?.id],
      });
    },
    onError: (err: Error) =>
      alert(err.message || "Failed to verify project links"),
  });

  const prReviewMut = useMutation({
    mutationFn: (vars: { id: string; prUrl: string }) =>
      reviewProjectPullRequest(vars.id, vars.prUrl),
    onSuccess: (resData) => {
      setPrReviewData(resData);
      setPrReviewError("");
      queryClient.invalidateQueries({
        queryKey: ["portfolio", session?.user?.id],
      });
    },
    onError: (err: Error) =>
      setPrReviewError(err.message || "Failed to review Pull Request"),
  });

  const toggleReview = (id: string) => {
    setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isSessionLoading) {
    return <GenericPageSkeleton />;
  }

  if (!session?.user?.id) {
    redirect("/");
  }

  if (isLoading) {
    return <GenericPageSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <h3 className="text-xl font-bold text-destructive">Error</h3>
        <p className="text-muted-foreground">
          Failed to load portfolio. Please refresh.
        </p>
        <DashboardButton text="Retry" radius="md" onClick={() => refetch()} />
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      techStack: "",
      repositoryUrl: "",
      liveUrl: "",
    });
    setEditingProjectId(null);
    setErrorMsg("");
  };

  const resetImportForm = () => {
    setImportFormData({
      repositoryUrl: "",
      liveUrl: "",
      title: "",
      description: "",
      techStack: "",
    });
    setImportErrorMsg("");
  };

  const openImportModal = () => {
    resetImportForm();
    setIsImportModalOpen(true);
  };

  const openEditModal = (project: ProjectData) => {
    setFormData({
      title: project.name,
      description: project.description || "",
      techStack: project.techStack.join(", "),
      repositoryUrl: project.githubUrl || "",
      liveUrl: project.liveDemoUrl || "",
    });
    setEditingProjectId(project.id);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!formData.title || !formData.description) {
      setErrorMsg("Title and Description are required");
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      techStack: formData.techStack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      repositoryUrl: formData.repositoryUrl || undefined,
      liveUrl: formData.liveUrl || undefined,
      projectType: "GENERATED" as const,
    };

    if (editingProjectId) {
      updateMut.mutate({ id: editingProjectId, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportErrorMsg("");
    if (!importFormData.repositoryUrl) {
      setImportErrorMsg("GitHub Repository URL is required");
      return;
    }

    const payload = {
      repositoryUrl: importFormData.repositoryUrl,
      liveUrl: importFormData.liveUrl || undefined,
      title: importFormData.title || undefined,
      description: importFormData.description || undefined,
      techStack: importFormData.techStack
        ? importFormData.techStack
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
    };

    importMut.mutate(payload);
  };

  const isSaving = createMut.isPending || updateMut.isPending;
  const isImporting = importMut.isPending;

  const generatedProjectsCount = data.projects.filter(
    (p) => (p.projectType || "GENERATED") === "GENERATED",
  ).length;
  const importedProjectsCount = data.projects.filter(
    (p) => p.projectType === "IMPORTED",
  ).length;

  const filteredProjects = data.projects.filter((p) => {
    if (activeFilter === "GENERATED")
      return (p.projectType || "GENERATED") === "GENERATED";
    if (activeFilter === "IMPORTED") return p.projectType === "IMPORTED";
    return true;
  });

  const getLifecycleStatusPill = (project: ProjectData) => {
    const isGenerated = (project.projectType || "GENERATED") === "GENERATED";
    const hasRepo = Boolean(project.githubUrl);
    const isVerified = project.metrics.evidence === "verified";
    const hasReview = Boolean(project.aiReview);

    if (isGenerated) {
      if (isVerified && hasReview)
        return {
          text: "Proof Verified",
          color: "bg-green-500/10 text-green-500 border-green-500/20",
        };
      if (hasReview)
        return {
          text: "AI Reviewed",
          color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        };
      if (hasRepo)
        return {
          text: "Evidence Analyzed",
          color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
        };
      return {
        text: "Specification Generated (In Progress)",
        color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      };
    } else {
      if (isVerified && hasReview)
        return {
          text: "Proof Verified",
          color: "bg-green-500/10 text-green-500 border-green-500/20",
        };
      if (hasReview)
        return {
          text: "AI Reviewed",
          color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        };
      return {
        text: "GitHub Analyzed",
        color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      };
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <PageHeader
        title="Portfolio & Career Proof"
        description="Turn real implementation and GitHub evidence into verifiable career proof."
      />

      <DashboardCard className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground flex items-center justify-center md:justify-start gap-2">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              Overall Portfolio Strength
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Derived dynamically from technical depth, verified repository
              evidence, code analysis, and explanation quality.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center shrink-0">
            <div
              className={`text-5xl font-bold ${data.overallStrength > 70 ? "text-green-500" : data.overallStrength > 30 ? "text-amber-500" : "text-destructive"}`}
            >
              {data.overallStrength}%
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-1">
              Strength Score
            </span>
          </div>
        </CardContent>
      </DashboardCard>

      {/* TWO SEPARATE PRODUCT ENTRY CARDS FOR FLOW A & FLOW B */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
          PROJECT CREATION & IMPORT
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FLOW A ENTRY CARD */}
          <Card className="border border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50 transition-all flex flex-col justify-between p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  FLOW A — GIVE ME SOMETHING TO BUILD
                </span>
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Generate AI Project
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Want AI Pather to create a project based on your skill gaps? AI
                generates a dynamic build specification, requirements, and
                deliverables for your learning stage.
              </p>

              {generateErrorMsg && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center justify-between animate-in fade-in">
                  <span>{generateErrorMsg}</span>
                  <button
                    onClick={() => setGenerateErrorMsg(null)}
                    className="p-1 hover:bg-destructive/20 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="pt-6 space-y-2">
              <DashboardButton
                text={
                  generateAiProjectMut.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />{" "}
                      Generating AI Project...
                    </>
                  ) : (
                    <>
                      Generate AI Project <ArrowRight className="w-4 h-4" />
                    </>
                  )
                }
                icon={
                  generateAiProjectMut.isPending ? undefined : (
                    <Sparkles className="w-4 h-4" />
                  )
                }
                fullWidth
                radius="xl"
                disabled={generateAiProjectMut.isPending}
                onClick={() => generateAiProjectMut.mutate()}
              />
              <button
                type="button"
                onClick={() => router.push("/dashboard/learner/learning-path")}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
              >
                Or pick a milestone from My Roadmap →
              </button>
            </div>
          </Card>

          {/* FLOW B ENTRY CARD */}
          <Card className="border border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50 transition-all flex flex-col justify-between p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  FLOW B — ANALYZE SOMETHING I BUILT
                </span>
                <FolderGit2 className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Import Existing GitHub Project
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Already built a project outside AI Pather? Connect your GitHub
                repository and AI Pather will analyze what you actually built—no
                artificial spec required.
              </p>
            </div>
            <div className="pt-6">
              <DashboardButton
                text={
                  <>
                    Import Existing Project <ArrowRight className="w-4 h-4 " />
                  </>
                }
                icon={<FolderGit2 className="w-4 h-4" />}
                fullWidth
                radius="xl"
                className="bg-card text-black dark:text-white border border-border hover:bg-muted hover:text-black"
                onClick={openImportModal}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* PROJECT FILTER BAR & LIST */}
      <div className="space-y-4 mt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              Your Portfolio Projects ({data.projects.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Source of truth:{" "}
              <code className="text-primary font-mono font-bold">
                projectType
              </code>{" "}
              (GENERATED vs IMPORTED)
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl border border-border">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === "ALL"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({data.projects.length})
            </button>
            <button
              onClick={() => setActiveFilter("GENERATED")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                activeFilter === "GENERATED"
                  ? "bg-purple-500/20 text-purple-400 shadow-sm border border-purple-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3 h-3" /> AI Generated (
              {generatedProjectsCount})
            </button>
            <button
              onClick={() => setActiveFilter("IMPORTED")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                activeFilter === "IMPORTED"
                  ? "bg-blue-500/20 text-blue-400 shadow-sm border border-blue-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FolderGit2 className="w-3 h-3" /> Imported GitHub (
              {importedProjectsCount})
            </button>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <Card className="border-dashed border-2 border-border/60 bg-transparent shadow-none p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No projects found for the selected filter.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredProjects.map((project) => {
              const statusPill = getLifecycleStatusPill(project);
              const isGenerated =
                (project.projectType || "GENERATED") === "GENERATED";

              return (
                <div
                  key={project.id}
                  id={`project-${project.id}`}
                  className="scroll-mt-24 flex flex-col h-full"
                >
                  <DashboardCard
                    className={`flex flex-col h-full transition-all hover:border-primary/30 relative group ${
                      isGenerated
                        ? "border-l-4 border-l-purple-500"
                        : "border-l-4 border-l-blue-500"
                    }`}
                  >
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-1.5 bg-background border border-border rounded-md hover:text-primary transition-colors"
                        title="Edit project details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteErrorMsg(null);
                          setDeletingProject(project);
                        }}
                        className="p-1.5 bg-background border border-border rounded-md hover:text-destructive transition-colors disabled:opacity-50"
                        disabled={deleteMut.isPending}
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <CardHeader className="border-b border-border bg-card-soft/50 p-6 pt-10">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {isGenerated ? (
                          <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Sparkles className="w-3.5 h-3.5" /> AI Generated
                            Project
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <FolderGit2 className="w-3.5 h-3.5" /> Imported
                            GitHub Project
                          </span>
                        )}

                        {isGenerated &&
                          project.specification?.generatedForContext && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              🎯 {project.specification.generatedForContext}
                            </span>
                          )}

                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusPill.color}`}
                        >
                          {statusPill.text}
                        </span>
                      </div>

                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-background rounded-lg shadow-sm border border-border">
                            {isGenerated ? (
                              <Code2 className="w-6 h-6 text-purple-400" />
                            ) : (
                              <FolderGit2 className="w-6 h-6 text-blue-400" />
                            )}
                          </div>
                          <CardTitle className="text-xl">
                            {project.name}
                          </CardTitle>
                        </div>
                        <div className="flex gap-2">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg border border-border bg-background hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
                              title="View GitHub Repository"
                            >
                              <GitBranch className="w-5 h-5" />
                            </a>
                          )}
                          {project.liveDemoUrl && (
                            <a
                              href={project.liveDemoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg border border-border bg-background hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
                              title="View Live Demo"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {project.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-muted text-muted-foreground border border-border"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Technical Depth
                            </span>
                            <span className="font-semibold">
                              {project.metrics.technicalDepth}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${project.metrics.technicalDepth > 70 ? "bg-green-500" : "bg-amber-500"}`}
                              style={{
                                width: `${project.metrics.technicalDepth}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Explanation Quality
                            </span>
                            <span className="font-semibold">
                              {project.metrics.explanationQuality}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${project.metrics.explanationQuality > 70 ? "bg-green-500" : "bg-amber-500"}`}
                              style={{
                                width: `${project.metrics.explanationQuality}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/50">
                        <span className="text-sm font-semibold text-muted-foreground">
                          Evidence Status
                        </span>
                        <div className="flex items-center gap-3">
                          {project.metrics.evidence === "verified" ? (
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                              <CheckCircle2 className="w-4 h-4" /> Verified
                              Evidence
                            </span>
                          ) : project.metrics.evidence === "unverified" ? (
                            <span
                              className="flex items-center gap-1.5 text-sm font-semibold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20"
                              title="The provided URLs could not be verified."
                            >
                              <AlertTriangle className="w-4 h-4" /> Unable to
                              Verify
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-destructive bg-destructive/10 px-3 py-1 rounded-full border border-destructive/20">
                              <AlertTriangle className="w-4 h-4" /> Missing Code
                              Evidence
                            </span>
                          )}

                          {(project.githubUrl || project.liveDemoUrl) &&
                            project.metrics.evidence !== "verified" && (
                              <button
                                onClick={() => verifyMut.mutate(project.id)}
                                disabled={
                                  verifyMut.isPending &&
                                  verifyMut.variables === project.id
                                }
                                className="text-sm font-medium text-primary hover:brightness-110 flex items-center transition-all disabled:opacity-50"
                              >
                                {verifyMut.isPending &&
                                verifyMut.variables === project.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />{" "}
                                    Verifying...
                                  </>
                                ) : (
                                  "Verify Links"
                                )}
                              </button>
                            )}
                        </div>
                      </div>

                      <div className="mt-2 pt-4 border-t border-border/50">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              if (!project.aiReview) {
                                reviewMut.mutate(project.id);
                              } else {
                                toggleReview(project.id);
                              }
                            }}
                            className="text-sm font-medium flex items-center gap-2 text-primary hover:brightness-110 transition-colors"
                            disabled={
                              reviewMut.isPending &&
                              reviewMut.variables === project.id
                            }
                          >
                            <Sparkles className="w-4 h-4" />
                            {reviewMut.isPending &&
                            reviewMut.variables === project.id
                              ? "Analyzing Evidence..."
                              : project.aiReview
                                ? expandedReviews[project.id]
                                  ? "Hide Review & Analysis"
                                  : "View AI Review & Analysis"
                                : "Analyze & Review Project"}
                            {project.aiReview &&
                              (expandedReviews[project.id] ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              ))}
                          </button>

                          <div className="flex items-center gap-2">
                            {project.githubUrl && (
                              <button
                                type="button"
                                onClick={() => reanalyzeMut.mutate(project.id)}
                                disabled={
                                  reanalyzeMut.isPending &&
                                  reanalyzeMut.variables === project.id
                                }
                                className="text-xs font-semibold px-2.5 py-1 rounded bg-muted text-foreground hover:bg-muted/80 transition-colors flex items-center gap-1"
                                title="Re-inspect GitHub repository and recalculate evidence"
                              >
                                <RefreshCw
                                  className={`w-3.5 h-3.5 ${reanalyzeMut.isPending && reanalyzeMut.variables === project.id ? "animate-spin" : ""}`}
                                />
                                Re-analyze Evidence
                              </button>
                            )}
                            {project.githubUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPrModalProject({
                                    id: project.id,
                                    name: project.name,
                                    repoUrl: project.githubUrl,
                                  });
                                  setPrUrlInput("");
                                  setPrReviewData(null);
                                  setPrReviewError("");
                                }}
                                className="text-xs font-semibold px-2.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
                              >
                                <GitBranch className="w-3.5 h-3.5" />
                                Review PR
                              </button>
                            )}
                          </div>
                        </div>

                        {project.aiReview && expandedReviews[project.id] && (
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border text-sm space-y-4 animate-in slide-in-from-top-2">
                            {/* Review Source Identifier Banner */}
                            <div className="flex items-center gap-2 p-2.5 rounded-md bg-card border border-border/80 text-xs text-muted-foreground">
                              <Info className="w-4 h-4 shrink-0 text-primary" />
                              <span>
                                {project.aiReview.reviewSource ||
                                  (isGenerated
                                    ? "Compared against your AI-generated project requirements."
                                    : "Analyzed from your GitHub repository and available evidence.")}
                              </span>
                            </div>

                            {/* FLOW A ONLY: PLANNED VS ACTUAL TABLE */}
                            {isGenerated &&
                              project.plannedVsActual &&
                              project.plannedVsActual.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-border">
                                  <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-purple-400" />{" "}
                                    FLOW A: Planned vs Actual Implementation
                                    Comparison
                                  </h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-background text-muted-foreground border-b border-border">
                                          <th className="p-2 text-left font-semibold">
                                            Requirement
                                          </th>
                                          <th className="p-2 text-left font-semibold">
                                            Evidence Found
                                          </th>
                                          <th className="p-2 text-left font-semibold">
                                            Status
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {project.plannedVsActual.map(
                                          (item, idx) => {
                                            const isVerified =
                                              item.status === "Verified";
                                            const isPartial =
                                              item.status ===
                                              "Partially Verified";
                                            const isNotFound =
                                              item.status === "Not Found";

                                            return (
                                              <tr
                                                key={idx}
                                                className="border-b border-border/50 hover:bg-background/50"
                                              >
                                                <td className="p-2 font-medium">
                                                  {item.requirement}
                                                </td>
                                                <td className="p-2 text-muted-foreground">
                                                  {item.evidenceFound}
                                                </td>
                                                <td className="p-2">
                                                  <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                      isVerified
                                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                        : isPartial
                                                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                          : isNotFound
                                                            ? "bg-destructive/10 text-destructive border-destructive/20"
                                                            : "bg-muted text-muted-foreground border-border"
                                                    }`}
                                                  >
                                                    {item.status}
                                                  </span>
                                                </td>
                                              </tr>
                                            );
                                          },
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                            {/* AI SUMMARY (FLOW A Implementation Summary vs FLOW B Project Summary) */}
                            {project.aiSummary && (
                              <div className="space-y-2 pt-2 border-t border-border">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                  <FileCode2 className="w-4 h-4 text-primary" />
                                  {project.aiSummary.type ||
                                    (isGenerated
                                      ? "AI Implementation Summary"
                                      : "AI Project Summary")}
                                </h4>
                                <div className="p-3 bg-background rounded-md border border-border/70 text-xs space-y-2 text-muted-foreground">
                                  {project.aiSummary.evidenceNote && (
                                    <p className="text-amber-500 font-medium bg-amber-500/10 p-2 rounded border border-amber-500/20 mb-2 flex items-center gap-1.5">
                                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                                      {project.aiSummary.evidenceNote}
                                    </p>
                                  )}
                                  <p>
                                    <strong className="text-foreground">
                                      Purpose:{" "}
                                    </strong>
                                    {project.aiSummary.projectPurpose ||
                                      project.aiSummary.summary ||
                                      "N/A"}
                                  </p>
                                  {isGenerated && (
                                    <p>
                                      <strong className="text-foreground">
                                        Planned / Specified Stack:{" "}
                                      </strong>
                                      {project.aiSummary.plannedStack &&
                                      project.aiSummary.plannedStack.length > 0
                                        ? project.aiSummary.plannedStack.join(
                                            ", ",
                                          )
                                        : project.techStack.join(", ")}
                                    </p>
                                  )}
                                  <p>
                                    <strong className="text-foreground">
                                      Actual Stack Detected:{" "}
                                    </strong>
                                    {Array.isArray(
                                      project.aiSummary.actualTechnologies,
                                    )
                                      ? project.aiSummary.actualTechnologies.join(
                                          ", ",
                                        )
                                      : project.aiSummary.actualTechnologies ||
                                        "Unable to verify"}
                                  </p>
                                  {project.aiSummary.testing && (
                                    <p>
                                      <strong className="text-foreground">
                                        Testing:{" "}
                                      </strong>
                                      {project.aiSummary.testing}
                                    </p>
                                  )}
                                  {project.aiSummary.ciCd && (
                                    <p>
                                      <strong className="text-foreground">
                                        CI/CD:{" "}
                                      </strong>
                                      {project.aiSummary.ciCd}
                                    </p>
                                  )}
                                  {project.aiSummary.architecture && (
                                    <p>
                                      <strong className="text-foreground">
                                        Architecture:{" "}
                                      </strong>
                                      {project.aiSummary.architecture}
                                    </p>
                                  )}
                                  {project.aiSummary.deployment && (
                                    <p>
                                      <strong className="text-foreground">
                                        Deployment:{" "}
                                      </strong>
                                      {project.aiSummary.deployment}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between items-center pb-2 border-b border-border pt-2">
                              <span className="font-bold">
                                Overall AI Evidence Score
                              </span>
                              <span className="font-bold text-primary">
                                {project.aiReview.overallScore}/100
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {[
                                "technicalQuality",
                                "practicalImplementation",
                                "problemSolving",
                                "architecture",
                                "documentation",
                                "completeness",
                                "technicalExplanation",
                                "evidenceQuality",
                              ].map((key) => {
                                const dim = project.aiReview![key] as
                                  | { score: number }
                                  | undefined;
                                if (!dim) return null;
                                return (
                                  <div
                                    key={key}
                                    className="flex justify-between p-2 bg-background rounded border border-border/50"
                                  >
                                    <span className="capitalize">
                                      {key.replace(/([A-Z])/g, " $1").trim()}
                                    </span>
                                    <span className="font-semibold">
                                      {dim.score}/100
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {project.aiReview.strengths &&
                              project.aiReview.strengths.length > 0 && (
                                <div>
                                  <span className="font-semibold text-green-500 mb-1 block">
                                    Verified Strengths
                                  </span>
                                  <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs">
                                    {project.aiReview.strengths.map(
                                      (s: string, i: number) => (
                                        <li key={i}>{s}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}

                            {project.aiReview.weaknesses &&
                              project.aiReview.weaknesses.length > 0 && (
                                <div>
                                  <span className="font-semibold text-amber-500 mb-1 block">
                                    Missing / Weak Areas
                                  </span>
                                  <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs">
                                    {project.aiReview.weaknesses.map(
                                      (w: string, i: number) => (
                                        <li key={i}>{w}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}

                            {project.aiReview.recommendations &&
                              project.aiReview.recommendations.length > 0 && (
                                <div>
                                  <span className="font-semibold text-primary mb-1 block">
                                    Next Best Actions to Improve Score
                                  </span>
                                  <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs">
                                    {project.aiReview.recommendations.map(
                                      (r: string, i: number) => (
                                        <li key={i}>{r}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </DashboardCard>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-bold">Edit Project Metadata</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Description / Specification *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) =>
                    setFormData({ ...formData, techStack: e.target.value })
                  }
                  placeholder="React, TypeScript, Node.js"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  GitHub Repository URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.repositoryUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, repositoryUrl: e.target.value })
                  }
                  placeholder="https://github.com/username/repo"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Live Demo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, liveUrl: e.target.value })
                  }
                  placeholder="https://my-app.vercel.app"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {errorMsg && (
                <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <DashboardButton
                  type="submit"
                  text={
                    <>
                      {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Changes
                    </>
                  }
                  disabled={isSaving}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOW B: DEDICATED IMPORT EXISTING GITHUB PROJECT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border bg-blue-500/5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  FLOW B — IMPORT EXISTING PROJECT
                </span>
                <h3 className="text-lg font-bold flex items-center gap-2 mt-1">
                  <FolderGit2 className="w-5 h-5 text-blue-400" /> Import
                  Existing GitHub Project
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleImportSubmit}
              className="p-6 flex flex-col gap-4"
            >
              <div className="p-3 rounded-lg bg-muted/60 border border-border text-xs text-muted-foreground">
                <strong className="text-foreground block mb-0.5">
                  Already built a project outside AI Pather?
                </strong>
                Connect your GitHub repository and AI Pather will analyze what
                you actually built—no artificial spec required.
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  GitHub Repository URL *
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/owner/repository"
                  value={importFormData.repositoryUrl}
                  onChange={(e) =>
                    setImportFormData({
                      ...importFormData,
                      repositoryUrl: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Project Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Auto-detected from GitHub repo name if left blank"
                  value={importFormData.title}
                  onChange={(e) =>
                    setImportFormData({
                      ...importFormData,
                      title: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Project Description (Optional)
                </label>
                <textarea
                  placeholder="Auto-generated from repository README if left blank"
                  value={importFormData.description}
                  onChange={(e) =>
                    setImportFormData({
                      ...importFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[70px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Live Demo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://my-live-demo.com"
                  value={importFormData.liveUrl}
                  onChange={(e) =>
                    setImportFormData({
                      ...importFormData,
                      liveUrl: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {importErrorMsg && (
                <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  {importErrorMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <DashboardButton
                  type="submit"
                  text={
                    <>
                      {isImporting && (
                        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      )}
                      {isImporting
                        ? "Analyzing Repository..."
                        : "Analyze & Import Project"}
                    </>
                  }
                  disabled={isImporting}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PULL REQUEST REVIEW MODAL */}
      {prModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" /> Pull Request
                  Code Review
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Project: {prModalProject.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPrModalProject(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  GitHub Pull Request URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/owner/repo/pull/1"
                  value={prUrlInput}
                  onChange={(e) => setPrUrlInput(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a public pull request URL belonging to this project
                  repository.
                </p>
              </div>

              {prReviewError && (
                <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  {prReviewError}
                </div>
              )}

              {prReviewData && (
                <div className="mt-4 p-4 rounded-xl bg-card-soft border border-border/80 space-y-3 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">Review Verdict</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        prReviewData.verdict === "APPROVED"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}
                    >
                      {prReviewData.verdict || "REVIEWED"}
                    </span>
                  </div>
                  {typeof prReviewData.qualityScore === "number" && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        Quality Score:{" "}
                      </span>
                      <span className="font-bold text-primary">
                        {prReviewData.qualityScore}%
                      </span>
                    </div>
                  )}
                  {prReviewData.prSummary && (
                    <p className="text-xs text-muted-foreground">
                      {prReviewData.prSummary}
                    </p>
                  )}
                  {prReviewData.positives &&
                    prReviewData.positives.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-green-500 block mb-1">
                          Strengths:
                        </span>
                        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                          {prReviewData.positives.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {prReviewData.concerns &&
                    prReviewData.concerns.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-amber-500 block mb-1">
                          Concerns / Edge Cases:
                        </span>
                        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                          {prReviewData.concerns.map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {prReviewData.actionableSuggestions &&
                    prReviewData.actionableSuggestions.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-primary block mb-1">
                          Suggestions:
                        </span>
                        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                          {prReviewData.actionableSuggestions.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPrModalProject(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Close
                </button>
                <DashboardButton
                  type="button"
                  text={
                    <>
                      {prReviewMut.isPending && (
                        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      )}
                      {prReviewMut.isPending
                        ? "Analyzing PR Diff..."
                        : "Run AI Review"}
                    </>
                  }
                  disabled={!prUrlInput || prReviewMut.isPending}
                  onClick={() => {
                    if (prModalProject) {
                      prReviewMut.mutate({
                        id: prModalProject.id,
                        prUrl: prUrlInput,
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERATED PROJECT SPECIFICATION SUCCESS / DUPLICATE REUSE MODAL */}
      {generatedProjectSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-lg ${generatedProjectSpec.duplicate ? "bg-amber-500/10 text-amber-400" : "bg-purple-500/10 text-purple-400"}`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {generatedProjectSpec.duplicate
                      ? "You already have an AI project for this learning context."
                      : "AI Project Specification Generated!"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {generatedProjectSpec.duplicate
                      ? "AI Pather reused your existing project instead of creating another duplicate."
                      : "Flow A: Added to your Portfolio Projects"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGeneratedProjectSpec(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                  {generatedProjectSpec.project.specification
                    ?.generatedForContext || "AI Generated Project"}
                </span>
                <h4 className="text-xl font-bold text-foreground mt-0.5">
                  {generatedProjectSpec.project.name}
                </h4>
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed">
                {generatedProjectSpec.project.description}
              </p>

              {generatedProjectSpec.project.techStack &&
                generatedProjectSpec.project.techStack.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-foreground block mb-1">
                      Recommended Tech Stack:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedProjectSpec.project.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded bg-muted text-foreground border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {generatedProjectSpec.duplicate ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1 text-amber-300">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" /> Existing
                    Project Reused:
                  </p>
                  <p className="text-muted-foreground">
                    This context already has a project, so AI Pather reused the
                    existing project instead of creating another one.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs space-y-1 text-purple-300">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" /> What to
                    do next:
                  </p>
                  <p className="text-muted-foreground">
                    Build this project independently in your local environment,
                    then link your public GitHub repository to verify evidence
                    and earn proof.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <DashboardButton
                text={
                  generatedProjectSpec.duplicate
                    ? "View Existing Project"
                    : "Got It & View Project"
                }
                fullWidth
                radius="xl"
                onClick={() => {
                  const targetId = generatedProjectSpec.project.id;
                  setGeneratedProjectSpec(null);
                  setTimeout(() => {
                    const el = document.getElementById(`project-${targetId}`);
                    if (el)
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                  }, 100);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Delete Project?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!deleteMut.isPending) {
                    setDeletingProject(null);
                    setDeleteErrorMsg(null);
                  }
                }}
                disabled={deleteMut.isPending}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground leading-relaxed">
                Are you sure you want to delete this project? This action cannot
                be undone.
              </p>

              <div className="p-3 bg-muted/60 border border-border rounded-xl space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Project:
                </span>
                <p className="font-bold text-foreground line-clamp-2">
                  {deletingProject.name}
                </p>
              </div>

              {deleteErrorMsg && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center justify-between animate-in fade-in">
                  <span>{deleteErrorMsg}</span>
                  <button
                    type="button"
                    onClick={() => setDeleteErrorMsg(null)}
                    className="p-1 hover:bg-destructive/20 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingProject(null);
                  setDeleteErrorMsg(null);
                }}
                disabled={deleteMut.isPending}
                className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <DashboardButton
                type="button"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                text={
                  deleteMut.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />{" "}
                      Deleting...
                    </>
                  ) : (
                    "Delete Project"
                  )
                }
                disabled={deleteMut.isPending}
                onClick={() => deleteMut.mutate(deletingProject.id)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
