"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { getPortfolio, createProject, updateProject, deleteProject, generateProjectReview, verifyProjectUrls } from "@/src/lib/api/learner/portfolio";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import GenericPageSkeleton from "../../shared/GenericPageSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { FolderGit2, ExternalLink, GitBranch, CheckCircle2, AlertTriangle, FileCode2, Star, Loader2, Trash2, Edit2, X, Plus, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

export default function PortfolioPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    repositoryUrl: "",
    liveUrl: ""
  });
  
  const [errorMsg, setErrorMsg] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["portfolio", session?.user?.id],
    queryFn: () => getPortfolio(),
    enabled: !!session?.user?.id,
  });

  const createMut = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["careerTwin", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData", session?.user?.id] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: Error) => setErrorMsg(err.message || "Failed to create project")
  });

  const updateMut = useMutation({
    mutationFn: (vars: { id: string, data: Record<string, unknown> }) => updateProject(vars.id, vars.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["careerTwin", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData", session?.user?.id] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: Error) => setErrorMsg(err.message || "Failed to update project")
  });

  const deleteMut = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["careerTwin", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData", session?.user?.id] });
    }
  });

  const reviewMut = useMutation({
    mutationFn: generateProjectReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["careerTwin", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData", session?.user?.id] });
    },
    onError: (err: Error) => alert(err.message || "Unable to review project.")
  });

  const verifyMut = useMutation({
    mutationFn: verifyProjectUrls,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["careerTwin", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData", session?.user?.id] });
    },
    onError: (err: Error) => alert(err.message || "Failed to verify project links")
  });

  const toggleReview = (id: string) => {
    setExpandedReviews(prev => ({ ...prev, [id]: !prev[id] }));
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
        <p className="text-muted-foreground">Failed to load. Please refresh.</p>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", techStack: "", repositoryUrl: "", liveUrl: "" });
    setEditingProjectId(null);
    setErrorMsg("");
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (project: { id: string; name: string; description?: string; techStack: string[]; githubUrl?: string; liveDemoUrl?: string }) => {
    setFormData({
      title: project.name,
      description: project.description || "",
      techStack: project.techStack.join(", "),
      repositoryUrl: project.githubUrl || "",
      liveUrl: project.liveDemoUrl || ""
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
      techStack: formData.techStack.split(",").map(s => s.trim()).filter(Boolean),
      repositoryUrl: formData.repositoryUrl || undefined,
      liveUrl: formData.liveUrl || undefined,
    };

    if (editingProjectId) {
      updateMut.mutate({ id: editingProjectId, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  const renderEmptyState = () => (
    <Card className="border-dashed border-2 border-border/60 bg-transparent shadow-none">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <FolderGit2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">No projects evidence yet.</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Your portfolio strength is directly tied to the projects you build. Add your first project to start building your developer proof graph.
        </p>
        <button
          onClick={openAddModal}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:brightness-110 flex items-center transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Project
        </button>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Portfolio Strength</h1>
        <p className="text-muted-foreground">Manage and analyze your project portfolio evidence.</p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground flex items-center justify-center md:justify-start gap-2">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              Overall Strength
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Based on the technical depth, explanation quality, and verifiable evidence of your projects.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className={`text-5xl font-bold ${data.overallStrength > 70 ? 'text-green-500' : data.overallStrength > 30 ? 'text-amber-500' : 'text-destructive'}`}>
              {data.overallStrength}%
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-1">Score</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-4">
        <h2 className="text-xl font-semibold">Your Projects</h2>
        {data.projects.length > 0 && (
          <button
            onClick={openAddModal}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 flex items-center transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Project
          </button>
        )}
      </div>

      {data.projects.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {data.projects.map((project) => (
            <Card key={project.id} className="flex flex-col h-full transition-all hover:border-primary/30 relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={() => openEditModal(project)}
                  className="p-1.5 bg-background border border-border rounded-md hover:text-primary transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this project?")) {
                      deleteMut.mutate(project.id);
                    }
                  }}
                  className="p-1.5 bg-background border border-border rounded-md hover:text-destructive transition-colors disabled:opacity-50"
                  disabled={deleteMut.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <CardHeader className="border-b border-border bg-card-soft/50 p-6 pt-12">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-background rounded-lg shadow-sm border border-border">
                      <FileCode2 className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-border bg-background hover:bg-card transition-colors text-muted-foreground hover:text-foreground">
                        <GitBranch className="w-5 h-5" />
                      </a>
                    )}
                    {project.liveDemoUrl && (
                      <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-border bg-background hover:bg-card transition-colors text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.techStack.map((tech, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs font-semibold rounded-md bg-muted text-muted-foreground border border-border">
                      {tech}
                    </span>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-6 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Technical Depth</span>
                      <span className="font-semibold">{project.metrics.technicalDepth}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${project.metrics.technicalDepth > 70 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${project.metrics.technicalDepth}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Explanation Quality</span>
                      <span className="font-semibold">{project.metrics.explanationQuality}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${project.metrics.explanationQuality > 70 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${project.metrics.explanationQuality}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/50">
                  <span className="text-sm font-semibold text-muted-foreground">Evidence Status</span>
                  <div className="flex items-center gap-3">
                    {project.metrics.evidence === 'verified' ? (
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Verified
                      </span>
                    ) : project.metrics.evidence === 'unverified' ? (
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20" title="The provided URLs could not be reached or verified.">
                        <AlertTriangle className="w-4 h-4" /> Unable to Verify
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-destructive bg-destructive/10 px-3 py-1 rounded-full border border-destructive/20">
                        <AlertTriangle className="w-4 h-4" /> Missing URLs
                      </span>
                    )}
                    
                    {(project.githubUrl || project.liveDemoUrl) && project.metrics.evidence !== 'verified' && (
                      <button
                        onClick={() => verifyMut.mutate(project.id)}
                        disabled={verifyMut.isPending && verifyMut.variables === project.id}
                        className="text-sm font-medium text-primary hover:brightness-110 flex items-center transition-all disabled:opacity-50"
                      >
                        {verifyMut.isPending && verifyMut.variables === project.id ? (
                          <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Verifying...</>
                        ) : (
                          "Verify Links"
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => {
                        if (!project.aiReview) {
                          reviewMut.mutate(project.id);
                        } else {
                          toggleReview(project.id);
                        }
                      }}
                      className="text-sm font-medium flex items-center gap-2 text-primary hover:brightness-110 transition-colors"
                      disabled={reviewMut.isPending && reviewMut.variables === project.id}
                    >
                      <Sparkles className="w-4 h-4" />
                      {reviewMut.isPending && reviewMut.variables === project.id 
                        ? "Reviewing project..." 
                        : project.aiReview 
                          ? expandedReviews[project.id] ? "Hide Review" : "View AI Review" 
                          : "Review Project"
                      }
                      {project.aiReview && (expandedReviews[project.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </button>
                    {project.aiReview && (
                      <button 
                        onClick={() => reviewMut.mutate(project.id)}
                        disabled={reviewMut.isPending && reviewMut.variables === project.id}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                  
                  {project.aiReview && expandedReviews[project.id] && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border text-sm space-y-4 animate-in slide-in-from-top-2">
                      <div className="flex justify-between items-center pb-2 border-b border-border">
                        <span className="font-bold">Overall Score</span>
                        <span className="font-bold text-primary">{project.aiReview.overallScore}/100</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {['technicalQuality', 'practicalImplementation', 'problemSolving', 'architecture', 'documentation', 'completeness', 'technicalExplanation', 'evidenceQuality'].map((key) => {
                          const dim = project.aiReview![key] as { score: number } | undefined;
                          if (!dim) return null;
                          return (
                            <div key={key} className="flex justify-between p-2 bg-background rounded border border-border/50">
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="font-semibold">{dim.score}/100</span>
                            </div>
                          );
                        })}
                      </div>

                      {project.aiReview.strengths && project.aiReview.strengths.length > 0 && (
                        <div>
                          <span className="font-semibold text-green-500 mb-1 block">Strengths</span>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            {project.aiReview.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                      
                      {project.aiReview.weaknesses && project.aiReview.weaknesses.length > 0 && (
                        <div>
                          <span className="font-semibold text-amber-500 mb-1 block">Needs Improvement</span>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            {project.aiReview.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                          </ul>
                        </div>
                      )}
                      
                      {project.aiReview.recommendations && project.aiReview.recommendations.length > 0 && (
                        <div>
                          <span className="font-semibold text-primary mb-1 block">Recommendations</span>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            {project.aiReview.recommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-bold">{editingProjectId ? 'Edit Project' : 'Add Project'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Title *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description *</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tech Stack (comma separated)</label>
                <input 
                  type="text" 
                  value={formData.techStack}
                  onChange={e => setFormData({...formData, techStack: e.target.value})}
                  placeholder="React, TypeScript, Node.js"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">GitHub URL</label>
                <input 
                  type="url" 
                  value={formData.repositoryUrl}
                  onChange={e => setFormData({...formData, repositoryUrl: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Live Demo URL</label>
                <input 
                  type="url" 
                  value={formData.liveUrl}
                  onChange={e => setFormData({...formData, liveUrl: e.target.value})}
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
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition-all flex items-center disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingProjectId ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
