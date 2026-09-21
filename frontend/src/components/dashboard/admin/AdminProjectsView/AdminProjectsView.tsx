"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminProjects, AdminProjectItem } from "@/src/lib/api/admin/projects";
import { verifyAdminProject } from "@/src/lib/actions/admin/projects";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import {
  FolderKanban,
  User,
  ExternalLink,
  GitBranch,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import { useDebounce } from "use-debounce";
import {
  Key,
  Label,
  ListBox,
  Select,
  Modal,
  Button,
  useOverlayState,
} from "@heroui/react";
import AdminDataTable, { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";
import AdminPageSkeleton from "@/src/components/dashboard/admin/shared/AdminPageSkeleton";
import "../admin.css";

export default function AdminProjectsView() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [daysFilter, setDaysFilter] = useState<Key | null>(null);
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const take = 20;
  const skip = (page - 1) * take;

  const detailModal = useOverlayState();
  const [selectedProject, setSelectedProject] = useState<AdminProjectItem | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "adminProjects",
      userId,
      skip,
      take,
      debouncedSearch,
      daysFilter,
    ],
    queryFn: () =>
      getAdminProjects(
        userId!,
        skip,
        take,
        debouncedSearch,
        daysFilter ? Number(daysFilter) : undefined
      ),
    enabled: !!userId,
  });


  const verifyMutation = useMutation({
    mutationFn: ({
      projectId,
      isVerified,
      score,
    }: {
      projectId: string;
      isVerified: boolean;
      score?: number;
    }) => verifyAdminProject(userId!, projectId, isVerified, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
    },
    onError: (err: Error | { message?: string }) => {
      alert(err.message || "Failed to update project verification");
    },
  });

  const handleToggleVerification = (p: AdminProjectItem) => {
    verifyMutation.mutate({
      projectId: p.id,
      isVerified: !p.isVerified,
    });
  };

  const handleInspect = (p: AdminProjectItem) => {
    setSelectedProject(p);
    detailModal.open();
  };

  const columns: AdminDataTableColumn<AdminProjectItem>[] = [
    {
      header: "Project",
      render: (p) => (
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
            <FolderKanban className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-foreground">{p.title}</p>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-semibold ${
                  p.projectType === "IMPORTED"
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                    : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                }`}
              >
                {p.projectType === "IMPORTED" ? (
                  <GitBranch className="size-2.5" />
                ) : (
                  <Sparkles className="size-2.5" />
                )}
                {p.projectType === "IMPORTED" ? "Imported Repo" : "AI Specification"}
              </span>
              {p.isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 px-2 py-0.2 text-[10px] font-semibold">
                  <CheckCircle2 className="size-2.5" /> Verified Proof
                </span>
              ) : null}
            </div>
            {p.description && (
              <p className="text-xs text-muted-foreground truncate max-w-[280px] mt-0.5">
                {p.description}
              </p>
            )}
            {p.techStack && p.techStack.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {p.techStack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
                {p.techStack.length > 3 && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    +{p.techStack.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Learner",
      render: (p) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">{p.user?.name || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">{p.user?.email || "No email"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Score",
      align: "center",
      render: (p) => {
        const score = p.score ?? 0;
        return (
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                score >= 80
                  ? "bg-green-500/10 text-green-500"
                  : score >= 50
                    ? "bg-orange-500/10 text-orange-500"
                    : "bg-red-500/10 text-red-500"
              }`}
            >
              {score}%
            </span>
          </div>
        );
      },
    },
    {
      header: "Evidence",
      align: "center",
      render: (p) => (
        <div className="flex items-center justify-center gap-3">
          {p.repositoryUrl ? (
            <a
              href={p.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Git Repository"
            >
              <GitBranch className="h-4 w-4" />
            </a>
          ) : (
            <GitBranch className="h-4 w-4 opacity-20" />
          )}
          {p.liveUrl ? (
            <a
              href={p.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Live Deployment"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <ExternalLink className="h-4 w-4 opacity-20" />
          )}
        </div>
      ),
    },
    {
      header: "Date",
      align: "center",
      render: (p) => (
        <div className="flex justify-center text-center">
          <span className="whitespace-nowrap text-muted-foreground text-xs">
            {new Date(p.createdAt).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      header: "Verification Action",
      align: "center",
      render: (p) => {
        const isPending =
          verifyMutation.isPending && verifyMutation.variables?.projectId === p.id;
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleToggleVerification(p)}
              disabled={isPending}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                p.isVerified
                  ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                  : "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/30"
              }`}
              title={p.isVerified ? "Revoke Verification" : "Approve & Verify Project"}
            >
              {isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : p.isVerified ? (
                <>
                  <ShieldAlert className="size-3" /> Revoke
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3" /> Verify
                </>
              )}
            </button>
            <button
              onClick={() => handleInspect(p)}
              className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
              title="Inspect Project"
            >
              <Eye className="size-4" />
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading && !data) {
    return (
      <AdminPageSkeleton
        variant="table"
        hasKpis={false}
        hasSearch={true}
        hasToolbar={true}
        dropdownCount={1}
      />
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load projects. Please try again.</p>
      </div>
    );
  } 

  const { projects, total } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">Submitted <span className="text-brand">Projects</span></h1>
          <p className="section-subtitle mt-1 text-left">Inspect, evaluate, and verify learner projects submitted from roadmaps</p>
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        rows={projects}
        rowKey={(p) => p.id}
        emptyMessage="No projects found."
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        searchPlaceholder="Search projects by title..."
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
                <ListBox.Item key="365" id="365" textValue="Last Year">
                  Last Year
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        }
        exportCsv={() => exportAdminData(userId!, "projects")}
        page={page}
        take={take}
        total={total}
        onPageChange={setPage}
      />




      {/* Project Detail Modal */}
      <Modal state={detailModal}>
        <Modal.Backdrop className="bg-black/70 backdrop-blur-sm z-50">
          <Modal.Container className="z-50 p-4">
            <Modal.Dialog
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              className="sm:max-w-[640px] w-full rounded-2xl border border-border bg-card text-card-foreground shadow-2xl p-6 relative overflow-hidden"
            >
              <Modal.CloseTrigger className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-primary hover:bg-primary/90 text-white dark:text-black transition-all duration-200 cursor-pointer shadow-sm z-20">
                <X className="size-4" />
              </Modal.CloseTrigger>
              <Modal.Header className="border-b border-border/40 pb-4 flex items-center gap-3.5 relative z-10">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <FolderKanban className="size-5" />
                </div>
                <div>
                  <Modal.Heading className="text-lg font-bold text-foreground tracking-tight">
                    {selectedProject?.title}
                  </Modal.Heading>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Project Verification & Build Details
                  </p>
                </div>
              </Modal.Header>
              <Modal.Body
                data-lenis-prevent="true"
                data-lenis-prevent-wheel="true"
                data-lenis-prevent-touch="true"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                className="space-y-4 overflow-y-auto overscroll-contain max-h-[75vh] py-4"
              >
                {selectedProject && (
                  <>
                    <div className="rounded-xl bg-muted/40 p-4 border border-border/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Learner</span>
                        <span className="text-xs font-semibold text-foreground">
                          {selectedProject.user?.name} ({selectedProject.user?.email})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Project Type</span>
                        <span className="text-xs font-semibold text-foreground">
                          {selectedProject.projectType === "IMPORTED"
                            ? "Imported GitHub Repository"
                            : "AI Generated Build Specification"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Verification Status</span>
                        <span
                          className={`text-xs font-bold ${
                            selectedProject.isVerified ? "text-emerald-500" : "text-amber-500"
                          }`}
                        >
                          {selectedProject.isVerified ? "Verified Proof" : "Pending Verification"}
                        </span>
                      </div>
                    </div>

                    {selectedProject.description && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          Description
                        </h4>
                        <p className="text-xs text-foreground leading-relaxed">
                          {selectedProject.description}
                        </p>
                      </div>
                    )}

                    {selectedProject.techStack && selectedProject.techStack.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Technologies Used
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProject.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      {selectedProject.repositoryUrl && (
                        <a
                          href={selectedProject.repositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                        >
                          <GitBranch className="size-3.5" /> View Git Repo
                        </a>
                      )}
                      {selectedProject.liveUrl && (
                        <a
                          href={selectedProject.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:underline"
                        >
                          <ExternalLink className="size-3.5" /> View Live Deployment
                        </a>
                      )}
                    </div>
                  </>
                )}
              </Modal.Body>
              <Modal.Footer className="border-t border-border/40 pt-4">
                <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white dark:text-black font-semibold py-2.5 transition-colors cursor-pointer" slot="close">
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
