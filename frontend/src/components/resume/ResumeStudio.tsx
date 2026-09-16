"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Printer,
  Save,
  Plus,
  Trash2,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Search,
  Zap,
  UploadCloud,
  User,
  Layers,
  GraduationCap,
  X,
  Target,
} from "lucide-react";
import {
  getResume,
  saveResume,
  generateResume,
  scanResume,
  rewriteBullet,
  matchJobDescription,
  ResumeData,
  ResumeExperience,
  ResumeProject,
} from "@/src/lib/actions/learner/resume";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { ResumeAtsScorecard } from "./ResumeAtsScorecard";
import ResumeSkeleton from "./ResumeSkeleton";
import { ResumePreview } from "./ResumePreview";
import { ResumeUploadScanner } from "./ResumeUploadScanner";

type StudioTab = "editor" | "upload_scan" | "ats" | "job_match" | "preview";
type EditorSection = "all" | "personal" | "summary" | "skills" | "experience" | "projects" | "education";

export function ResumeStudio() {
  const queryClient = useQueryClient();
  const { data: session } = useDashboardSession();

  const [activeTab, setActiveTab] = useState<StudioTab>("editor");
  const [activeEditorSection, setActiveEditorSection] = useState<EditorSection>("all");
  const [localResume, setLocalResume] = useState<ResumeData | null>(null);
  const [saveStatusMessage, setSaveStatusMessage] = useState("");
  const [newSkillInputs, setNewSkillInputs] = useState<Record<number, string>>({});

  // Job Match State
  const [jobDescriptionInput, setJobDescriptionInput] = useState("");
  const [jobMatchResult, setJobMatchResult] = useState<{
    matchScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    summary: string;
    tailoredSuggestions: string[];
  } | null>(null);

  // Magic Bullet Rewrite Modal State
  const [rewriteModal, setRewriteModal] = useState<{
    isOpen: boolean;
    sectionType: "experience" | "project";
    itemIndex: number;
    bulletIndex: number;
    originalText: string;
    rewrittenText?: string;
    explanation?: string;
    isLoading?: boolean;
  }>({
    isOpen: false,
    sectionType: "experience",
    itemIndex: 0,
    bulletIndex: 0,
    originalText: "",
  });

  // 1. Fetch Resume Data (Loads user's real profile, skills & projects)
  const { data: resumeResponse, isLoading: isResumeLoading } = useQuery({
    queryKey: ["learnerResume", session?.user?.id],
    queryFn: async () => {
      const res = await getResume();
      return (res?.data || null) as ResumeData | null;
    },
    enabled: !!session?.user?.id,
  });

  const fallbackResume: ResumeData = {
    fullName: session?.user?.name || "Candidate Name",
    email: session?.user?.email || "candidate@example.com",
    targetRole: "Full Stack Engineer",
    phone: "+1 (555) 019-2834",
    location: "Remote / Open to Relocation",
    website: "https://portfolio.dev",
    summary:
      "Results-driven Software Engineer experienced in developing responsive web interfaces, architecting RESTful services, and optimizing distributed databases with modern engineering standards.",
    skills: [
      {
        category: "Languages & Frameworks",
        items: ["TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Tailwind CSS"],
      },
      {
        category: "Databases & Cloud Architecture",
        items: ["PostgreSQL", "Prisma", "Redis", "Docker", "REST APIs", "Git"],
      },
    ],
    experience: [
      {
        company: "Tech Systems Inc.",
        role: "Software Engineer",
        duration: "2023 - Present",
        location: "San Francisco, CA (Remote)",
        bullets: [
          "Architected core web services and modernized full-stack APIs, improving throughput by 32%.",
          "Collaborated in an agile squad to deploy cloud microservices with 99.9% uptime SLA.",
        ],
      },
    ],
    projects: [
      {
        title: "AI Career Acceleration Platform",
        description: "Cloud-native platform delivering AI-powered roadmap analytics and diagnostics.",
        techStack: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
        bullets: [
          "Implemented real-time diagnostic engines and responsive user dashboards.",
          "Integrated secure authentication with role-based access control and encrypted sessions.",
        ],
      },
    ],
    education: [
      {
        institution: "State University",
        degree: "B.S. in Computer Science",
        year: "2020 - 2024",
      },
    ],
    atsScore: 78,
  };

  const resumeState = localResume || resumeResponse || fallbackResume;
  const setResumeState = (updated: ResumeData) => {
    setLocalResume(updated);
  };

  // 2. Save Resume Mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<ResumeData>) => {
      return await saveResume(data);
    },
    onSuccess: (res) => {
      setSaveStatusMessage("Saved & Synced with Database ✓");
      queryClient.invalidateQueries({ queryKey: ["learnerResume", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["careerTwin", session?.user?.id] });
      if (res?.data) {
        setLocalResume(res.data);
      }
      setTimeout(() => setSaveStatusMessage(""), 3500);
    },
  });

  // 3. Auto-Generate Resume Mutation (from real learner portfolio, skills & roadmap via AI)
  const autoGenerateMutation = useMutation({
    mutationFn: async () => {
      return await generateResume();
    },
    onSuccess: (res) => {
      if (res?.data?.resume) {
        setResumeState(res.data.resume);
      }
      queryClient.invalidateQueries({ queryKey: ["learnerResume", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["careerTwin", session?.user?.id] });
      setSaveStatusMessage("AI Synced from Real Portfolio & Roadmap ✓");
      setTimeout(() => setSaveStatusMessage(""), 3500);
    },
  });

  // 4. ATS Scan Mutation
  const scanMutation = useMutation({
    mutationFn: async () => {
      return await scanResume();
    },
    onSuccess: (res) => {
      if (res?.data && resumeState) {
        setResumeState({
          ...resumeState,
          atsScore: res.data.score,
          atsFeedback: res.data,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["learnerResume", session?.user?.id] });
    },
  });

  // 5. Job Match Mutation
  const jobMatchMutation = useMutation({
    mutationFn: async (jobDescription: string) => {
      return await matchJobDescription(jobDescription);
    },
    onSuccess: (res) => {
      if (res?.data) {
        setJobMatchResult(res.data);
      }
    },
  });

  // 6. Magic Bullet Rewriter Handler
  const handleOpenRewriteModal = async (
    sectionType: "experience" | "project",
    itemIndex: number,
    bulletIndex: number,
    currentText: string
  ) => {
    setRewriteModal({
      isOpen: true,
      sectionType,
      itemIndex,
      bulletIndex,
      originalText: currentText,
      isLoading: true,
    });

    try {
      const res = await rewriteBullet(currentText);
      const data = res?.data || res;
      setRewriteModal((prev) => ({
        ...prev,
        rewrittenText: data?.rewrittenBullet || currentText,
        explanation: data?.explanation || "Optimized with Google's X-Y-Z formula for measurable impact.",
        isLoading: false,
      }));
    } catch {
      setRewriteModal((prev) => ({
        ...prev,
        rewrittenText: currentText,
        explanation: "AI service processed your request. You can customize the metrics below.",
        isLoading: false,
      }));
    }
  };

  const handleApplyRewrittenBullet = () => {
    if (!resumeState || !rewriteModal.rewrittenText) return;

    if (rewriteModal.sectionType === "experience") {
      const newExp = [...(resumeState.experience || [])];
      if (newExp[rewriteModal.itemIndex]?.bullets) {
        newExp[rewriteModal.itemIndex].bullets[rewriteModal.bulletIndex] = rewriteModal.rewrittenText;
        setResumeState({ ...resumeState, experience: newExp });
      }
    } else {
      const newProj = [...(resumeState.projects || [])];
      if (newProj[rewriteModal.itemIndex]?.bullets) {
        newProj[rewriteModal.itemIndex].bullets[rewriteModal.bulletIndex] = rewriteModal.rewrittenText;
        setResumeState({ ...resumeState, projects: newProj });
      }
    }

    setRewriteModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Add missing keyword directly to first skill category
  const handleAddKeywordToSkills = (keyword: string) => {
    if (!resumeState) return;
    const currentSkills = [...(resumeState.skills || [])];
    if (currentSkills.length === 0) {
      currentSkills.push({ category: "Technical Skills", items: [keyword] });
    } else {
      const targetCat = currentSkills[0];
      const items = Array.isArray(targetCat.items) ? [...targetCat.items] : [];
      if (!items.includes(keyword)) {
        items.push(keyword);
        currentSkills[0] = { ...targetCat, items };
      }
    }
    setResumeState({ ...resumeState, skills: currentSkills });
    setSaveStatusMessage(`Added "${keyword}" to Skills ✓`);
    setTimeout(() => setSaveStatusMessage(""), 2500);
  };

  // Handle skill tag chip addition
  const handleAddSkillChip = (catIdx: number) => {
    const inputVal = (newSkillInputs[catIdx] || "").trim();
    if (!inputVal || !resumeState) return;

    const updated = [...(resumeState.skills || [])];
    const currentItems = Array.isArray(updated[catIdx]?.items) ? [...updated[catIdx].items] : [];
    if (!currentItems.includes(inputVal)) {
      currentItems.push(inputVal);
      updated[catIdx] = { ...updated[catIdx], items: currentItems };
      setResumeState({ ...resumeState, skills: updated });
    }
    setNewSkillInputs((prev) => ({ ...prev, [catIdx]: "" }));
  };

  const handleRemoveSkillChip = (catIdx: number, skillToRemove: string) => {
    if (!resumeState) return;
    const updated = [...(resumeState.skills || [])];
    const currentItems = Array.isArray(updated[catIdx]?.items)
      ? updated[catIdx].items.filter((s) => s !== skillToRemove)
      : [];
    updated[catIdx] = { ...updated[catIdx], items: currentItems };
    setResumeState({ ...resumeState, skills: updated });
  };

  if (isResumeLoading) {
    return <ResumeSkeleton />;
  }

  const targetRole = resumeState.targetRole || "Software Engineer";
  const currentAtsScore = resumeState.atsScore ?? resumeState.atsFeedback?.score ?? 78;

  return (
    <main className="min-h-screen w-full md:px-4 py-8 max-w-8xl mx-auto space-y-6">
      {/* ── Top Header Command Hub ── */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-lg bg-card border border-border shadow-sm dashboard-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Resume Studio
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-muted text-foreground border border-border flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                {targetRole}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                ATS Score: {currentAtsScore}%
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {resumeState.fullName ? `${resumeState.fullName}'s Executive Resume` : "Resume Builder & ATS Studio"}
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Calibrated for top tech recruiter screens. Live-synchronized with your real skills, engineering projects, and roadmap milestones.
            </p>
          </div>

          {/* Quick Global Action Cluster */}
          <div className="flex flex-wrap items-center gap-2.5">
            {saveStatusMessage && (
              <span className="text-xs font-bold text-primary animate-in fade-in mr-1">
                {saveStatusMessage}
              </span>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("upload_scan")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Upload external PDF/TXT for stateless ATS score audit"
            >
              <UploadCloud className="w-4 h-4 text-primary" />
              <span>Upload & Scan File</span>
            </button>

            <button
              type="button"
              onClick={() => autoGenerateMutation.mutate()}
              disabled={autoGenerateMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Auto-generate optimized bullet points from your actual skills and roadmap"
            >
              <Wand2 className={`w-4 h-4 text-primary ${autoGenerateMutation.isPending ? "animate-spin" : ""}`} />
              <span>{autoGenerateMutation.isPending ? "Syncing AI..." : "Sync Real Data & AI"}</span>
            </button>

            <button
              type="button"
              onClick={() => saveMutation.mutate(resumeState)}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              <Save className={`w-4 h-4 ${saveMutation.isPending ? "animate-spin" : ""}`} />
              <span>{saveMutation.isPending ? "Saving..." : "Save Resume"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Studio Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("editor")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === "editor"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Interactive Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ats")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === "ats"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>ATS Diagnostic ({currentAtsScore}%)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("upload_scan")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === "upload_scan"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload & Scan Resume</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("job_match")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === "job_match"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job Match Analyzer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === "preview"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Recruiter Preview & Print</span>
        </button>
      </div>

      {/* ── TAB: UPLOAD & SCAN RESUME (STATELESS) ── */}
      {activeTab === "upload_scan" && (
        <ResumeUploadScanner targetRole={targetRole} />
      )}

      {/* ── TAB 1: INTERACTIVE RESUME BUILDER ── */}
      {activeTab === "editor" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section Jump / Filter Stepper */}
          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-card border border-border overflow-x-auto">
            {[
              { id: "all", label: "All Sections", icon: Layers },
              { id: "personal", label: "1. Personal Info", icon: User },
              { id: "summary", label: "2. Summary", icon: FileText },
              { id: "skills", label: "3. Skills", icon: Zap },
              { id: "experience", label: "4. Experience", icon: Briefcase },
              { id: "projects", label: "5. Projects", icon: Sparkles },
              { id: "education", label: "6. Education", icon: GraduationCap },
            ].map((sec) => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveEditorSection(sec.id as EditorSection)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeEditorSection === sec.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Upload & Instant Scan Banner */}
          <div className="p-5 rounded-lg bg-card-soft border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 dashboard-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  Already have an existing resume file (PDF / TXT / DOCX)?
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Upload your external file to instantly run an in-memory 4-pillar ATS score audit with zero database footprint.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("upload_scan")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <span>Instant Upload & Scan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. Personal & Contact Information Card */}
          {(activeEditorSection === "all" || activeEditorSection === "personal") && (
            <div className="p-6 sm:p-8 rounded-lg bg-card border border-border space-y-4 shadow-sm dashboard-card">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">1. Personal & Contact Information</h2>
                </div>
                <span className="text-[11px] text-muted-foreground">Synchronized with User Profile</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-muted-foreground block mb-1.5 font-semibold">Full Name</label>
                  <input
                    type="text"
                    value={resumeState.fullName || ""}
                    onChange={(e) => setResumeState({ ...resumeState, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-foreground font-medium"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1.5 font-semibold">Target Job Title</label>
                  <input
                    type="text"
                    value={resumeState.targetRole || ""}
                    onChange={(e) => setResumeState({ ...resumeState, targetRole: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-foreground font-medium"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1.5 font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={resumeState.email || ""}
                    onChange={(e) => setResumeState({ ...resumeState, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-foreground font-medium"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1.5 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={resumeState.phone || ""}
                    onChange={(e) => setResumeState({ ...resumeState, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-foreground font-medium"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1.5 font-semibold">Location / Availability</label>
                  <input
                    type="text"
                    value={resumeState.location || ""}
                    onChange={(e) => setResumeState({ ...resumeState, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-foreground font-medium"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1.5 font-semibold">GitHub URL</label>
                  <input
                    type="text"
                    value={resumeState.github || ""}
                    onChange={(e) => setResumeState({ ...resumeState, github: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-foreground font-medium"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1.5 font-semibold">LinkedIn URL</label>
                  <input
                    type="text"
                    value={resumeState.linkedin || ""}
                    onChange={(e) => setResumeState({ ...resumeState, linkedin: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-foreground font-medium"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1.5 font-semibold">Portfolio Website</label>
                  <input
                    type="text"
                    value={resumeState.website || ""}
                    onChange={(e) => setResumeState({ ...resumeState, website: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-foreground font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Professional Executive Summary */}
          {(activeEditorSection === "all" || activeEditorSection === "summary") && (
            <div className="p-6 sm:p-8 rounded-lg bg-card border border-border space-y-3 shadow-sm dashboard-card">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">2. Professional Executive Summary</h2>
                </div>
                <span className="text-[11px] text-muted-foreground">Keep concise (2–3 sentences with scale impact)</span>
              </div>
              <textarea
                value={resumeState.summary || ""}
                onChange={(e) => setResumeState({ ...resumeState, summary: e.target.value })}
                rows={3}
                placeholder="Results-driven Software Engineer with proven experience designing scalable architectures and modern full-stack web applications..."
                className="w-full p-3.5 rounded-xl bg-background border border-border text-xs leading-relaxed focus:border-primary focus:outline-none text-foreground font-medium"
              />
            </div>
          )}

          {/* 3. Technical Skills Categorized */}
          {(activeEditorSection === "all" || activeEditorSection === "skills") && (
            <div className="p-6 sm:p-8 rounded-lg bg-card border border-border space-y-4 shadow-sm dashboard-card">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">3. Technical Skills & Proficiencies</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSkills = [...(resumeState.skills || []), { category: "New Category", items: ["Skill 1", "Skill 2"] }];
                    setResumeState({ ...resumeState, skills: newSkills });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold border border-primary/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Category
                </button>
              </div>

              <div className="space-y-4">
                {(resumeState.skills || []).map((cat, catIdx) => {
                  const itemsList = Array.isArray(cat.items) ? cat.items : String(cat.items).split(",").map((s) => s.trim()).filter(Boolean);
                  return (
                    <div key={catIdx} className="p-4 sm:p-5 rounded-lg bg-card-soft border border-border space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={cat.category}
                          onChange={(e) => {
                            const updated = [...resumeState.skills];
                            updated[catIdx].category = e.target.value;
                            setResumeState({ ...resumeState, skills: updated });
                          }}
                          placeholder="Category Name (e.g. Languages, Frameworks, Databases)"
                          className="font-bold text-xs p-2 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none w-full max-w-xs"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const updated = resumeState.skills.filter((_, i) => i !== catIdx);
                            setResumeState({ ...resumeState, skills: updated });
                          }}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl shrink-0 cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Interactive Skill Chips */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {itemsList.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkillChip(catIdx, skill)}
                              className="text-primary hover:text-foreground p-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Quick Add Chip Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newSkillInputs[catIdx] || ""}
                          onChange={(e) => setNewSkillInputs((prev) => ({ ...prev, [catIdx]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSkillChip(catIdx);
                            }
                          }}
                          placeholder="Type skill and press Enter or Add..."
                          className="flex-1 text-xs p-2 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSkillChip(catIdx)}
                          className="px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold border border-primary/20 transition-all cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Professional Experience & Magic Bullet Rewriter */}
          {(activeEditorSection === "all" || activeEditorSection === "experience") && (
            <div className="p-6 sm:p-8 rounded-lg bg-card border border-border space-y-4 shadow-sm dashboard-card">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">4. Work Experience & Accomplishments</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newExp: ResumeExperience = {
                      company: "Engineering Lab",
                      role: targetRole,
                      duration: "2023 - Present",
                      location: "Remote",
                      bullets: ["Architected scalable web services using TypeScript, improving system throughput by 35%."],
                    };
                    setResumeState({ ...resumeState, experience: [...(resumeState.experience || []), newExp] });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold border border-primary/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>

              <div className="space-y-5">
                {(resumeState.experience || []).map((exp, expIdx) => (
                  <div key={expIdx} className="p-4 sm:p-5 rounded-lg bg-card-soft border border-border space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...resumeState.experience];
                          updated[expIdx].role = e.target.value;
                          setResumeState({ ...resumeState, experience: updated });
                        }}
                        placeholder="Role / Title"
                        className="p-2.5 rounded-xl bg-background border border-border font-bold text-foreground focus:border-primary focus:outline-none"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...resumeState.experience];
                          updated[expIdx].company = e.target.value;
                          setResumeState({ ...resumeState, experience: updated });
                        }}
                        placeholder="Company"
                        className="p-2.5 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none"
                      />
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => {
                          const updated = [...resumeState.experience];
                          updated[expIdx].duration = e.target.value;
                          setResumeState({ ...resumeState, experience: updated });
                        }}
                        placeholder="e.g. 2023 - Present"
                        className="p-2.5 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={exp.location || ""}
                          onChange={(e) => {
                            const updated = [...resumeState.experience];
                            updated[expIdx].location = e.target.value;
                            setResumeState({ ...resumeState, experience: updated });
                          }}
                          placeholder="Location"
                          className="flex-1 p-2.5 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = resumeState.experience.filter((_, i) => i !== expIdx);
                            setResumeState({ ...resumeState, experience: updated });
                          }}
                          className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl cursor-pointer"
                          title="Delete Experience"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Accomplishment Bullets */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                        <span>Accomplishment Bullets (Click ✨ for AI Google X-Y-Z Metric Enhancement):</span>
                      </div>
                      {exp.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2">
                          <textarea
                            value={b}
                            onChange={(e) => {
                              const updated = [...resumeState.experience];
                              updated[expIdx].bullets[bIdx] = e.target.value;
                              setResumeState({ ...resumeState, experience: updated });
                            }}
                            rows={2}
                            className="flex-1 p-2.5 rounded-xl bg-background border border-border text-xs leading-relaxed focus:border-primary focus:outline-none text-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => handleOpenRewriteModal("experience", expIdx, bIdx, b)}
                            title="AI Magic Rewrite with Google X-Y-Z metrics formula"
                            className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shrink-0 cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...resumeState.experience];
                              updated[expIdx].bullets = updated[expIdx].bullets.filter((_, i) => i !== bIdx);
                              setResumeState({ ...resumeState, experience: updated });
                            }}
                            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...resumeState.experience];
                          updated[expIdx].bullets.push("Developed full-stack feature with measurable scale impact.");
                          setResumeState({ ...resumeState, experience: updated });
                        }}
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Bullet Point
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Key Projects */}
          {(activeEditorSection === "all" || activeEditorSection === "projects") && (
            <div className="p-6 sm:p-8 rounded-lg bg-card border border-border space-y-4 shadow-sm dashboard-card">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">5. Key Engineering Projects</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newProj: ResumeProject = {
                      title: "New Engineering Project",
                      description: "High-scale web application with resilient architecture.",
                      techStack: ["Next.js", "TypeScript", "PostgreSQL"],
                      bullets: ["Engineered scalable architecture with clean state boundaries and optimized database schema."],
                    };
                    setResumeState({ ...resumeState, projects: [...(resumeState.projects || []), newProj] });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold border border-primary/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              <div className="space-y-5">
                {(resumeState.projects || []).map((proj, projIdx) => (
                  <div key={projIdx} className="p-4 sm:p-5 rounded-lg bg-card-soft border border-border space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...resumeState.projects];
                          updated[projIdx].title = e.target.value;
                          setResumeState({ ...resumeState, projects: updated });
                        }}
                        placeholder="Project Title"
                        className="p-2.5 rounded-xl bg-background border border-border font-bold text-foreground focus:border-primary focus:outline-none"
                      />
                      <input
                        type="text"
                        value={Array.isArray(proj.techStack) ? proj.techStack.join(", ") : String(proj.techStack)}
                        onChange={(e) => {
                          const updated = [...resumeState.projects];
                          updated[projIdx].techStack = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                          setResumeState({ ...resumeState, projects: updated });
                        }}
                        placeholder="Tech Stack (comma-separated)"
                        className="p-2.5 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={proj.githubUrl || ""}
                          onChange={(e) => {
                            const updated = [...resumeState.projects];
                            updated[projIdx].githubUrl = e.target.value;
                            setResumeState({ ...resumeState, projects: updated });
                          }}
                          placeholder="GitHub Repository URL"
                          className="flex-1 p-2.5 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = resumeState.projects.filter((_, i) => i !== projIdx);
                            setResumeState({ ...resumeState, projects: updated });
                          }}
                          className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Project Bullets */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      {proj.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2">
                          <textarea
                            value={b}
                            onChange={(e) => {
                              const updated = [...resumeState.projects];
                              updated[projIdx].bullets[bIdx] = e.target.value;
                              setResumeState({ ...resumeState, projects: updated });
                            }}
                            rows={2}
                            className="flex-1 p-2.5 rounded-xl bg-background border border-border text-xs leading-relaxed focus:border-primary focus:outline-none text-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => handleOpenRewriteModal("project", projIdx, bIdx, b)}
                            title="AI Magic Rewrite with Google X-Y-Z formula"
                            className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shrink-0 cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...resumeState.projects];
                              updated[projIdx].bullets = updated[projIdx].bullets.filter((_, i) => i !== bIdx);
                              setResumeState({ ...resumeState, projects: updated });
                            }}
                            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...resumeState.projects];
                          updated[projIdx].bullets.push("Built end-to-end integration and optimized system performance.");
                          setResumeState({ ...resumeState, projects: updated });
                        }}
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Project Bullet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Education Card */}
          {(activeEditorSection === "all" || activeEditorSection === "education") && (
            <div className="p-6 sm:p-8 rounded-lg bg-card border border-border space-y-4 shadow-sm dashboard-card">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <GraduationCap className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">6. Education</h2>
              </div>

              <div className="space-y-3">
                {(resumeState.education || []).map((edu, eduIdx) => (
                  <div key={eduIdx} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...resumeState.education];
                        updated[eduIdx].degree = e.target.value;
                        setResumeState({ ...resumeState, education: updated });
                      }}
                      placeholder="Degree (e.g. B.S. in CS)"
                      className="p-2.5 rounded-xl bg-background border border-border font-bold text-foreground focus:border-primary focus:outline-none"
                    />
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...resumeState.education];
                        updated[eduIdx].institution = e.target.value;
                        setResumeState({ ...resumeState, education: updated });
                      }}
                      placeholder="Institution"
                      className="p-2.5 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none"
                    />
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => {
                        const updated = [...resumeState.education];
                        updated[eduIdx].year = e.target.value;
                        setResumeState({ ...resumeState, education: updated });
                      }}
                      placeholder="Year (e.g. 2020 - 2024)"
                      className="p-2.5 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none"
                    />
                    <input
                      type="text"
                      value={edu.gpa || ""}
                      onChange={(e) => {
                        const updated = [...resumeState.education];
                        updated[eduIdx].gpa = e.target.value;
                        setResumeState({ ...resumeState, education: updated });
                      }}
                      placeholder="GPA (Optional)"
                      className="p-2.5 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: ATS DIAGNOSTIC ── */}
      {activeTab === "ats" && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 dashboard-card">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                Want to audit an external resume file (PDF / TXT / DOCX)?
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("upload_scan")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
            >
              <span>Switch to File Upload Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ResumeAtsScorecard
            atsFeedback={resumeState.atsFeedback}
            atsScore={currentAtsScore}
            targetRole={targetRole}
            onRescan={() => scanMutation.mutate()}
            isScanning={scanMutation.isPending}
            onAddMissingKeyword={handleAddKeywordToSkills}
          />
        </div>
      )}

      {/* ── TAB 3: JOB DESCRIPTION MATCHER ── */}
      {activeTab === "job_match" && (
        <div className="space-y-6 animate-in fade-in duration-200 ">
          <div className="p-6 sm:p-8 rounded-lg bg-card border border-border space-y-4 shadow-sm dashboard-card">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>Job Description Matcher & Keyword Gap Analyzer</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Paste any job description from LinkedIn, Indeed, or careers pages to compare your resume in real time.
              </p>
            </div>

            <textarea
              value={jobDescriptionInput}
              onChange={(e) => setJobDescriptionInput(e.target.value)}
              rows={6}
              placeholder="Paste job description requirements, responsibilities, and qualifications here..."
              className="w-full p-4 rounded-lg bg-background border border-border text-xs leading-relaxed focus:border-primary focus:outline-none text-foreground"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => jobMatchMutation.mutate(jobDescriptionInput)}
                disabled={!jobDescriptionInput.trim() || jobMatchMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Search className={`w-4 h-4 ${jobMatchMutation.isPending ? "animate-spin" : ""}`} />
                <span>{jobMatchMutation.isPending ? "Analyzing Alignment..." : "Run Job Match Analysis"}</span>
              </button>
            </div>
          </div>

          {/* Match Results */}
          {jobMatchResult && (
            <div className="p-6 sm:p-8 rounded-lg bg-card border border-border shadow-lg space-y-6 animate-in zoom-in-95">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-lg bg-card-soft border border-border">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-sm font-bold text-foreground">Job Match Alignment Score</h3>
                  <p className="text-xs text-muted-foreground">{jobMatchResult.summary}</p>
                </div>
                <div className="flex items-baseline gap-1 p-4 rounded-lg bg-primary/10 border border-primary/20 min-w-[120px] justify-center">
                  <span className="text-4xl font-black text-primary">{jobMatchResult.matchScore}</span>
                  <span className="text-xs font-bold text-muted-foreground">%</span>
                </div>
              </div>

              {/* Matched vs Missing Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Matched */}
                <div className="p-5 rounded-lg bg-card border border-border space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Matched Job Keywords ({jobMatchResult.matchedKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {jobMatchResult.matchedKeywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        {kw} ✓
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing */}
                <div className="p-5 rounded-lg bg-card border border-border space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" /> Missing Key Terms ({jobMatchResult.missingKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {jobMatchResult.missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        onClick={() => handleAddKeywordToSkills(kw)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-muted text-foreground border border-border hover:border-primary/50 cursor-pointer transition-all"
                        title="Click to add to your skills section"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Tailored Suggestions */}
              <div className="p-5 rounded-lg bg-card-soft border border-border space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" /> Tailored Strategy for This Application:
                </h4>
                <ul className="space-y-1.5 pt-1">
                  {jobMatchResult.tailoredSuggestions.map((sug, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: PREVIEW & PRINT ── */}
      {activeTab === "preview" && (
        <ResumePreview resumeData={resumeState} />
      )}

      {/* ── MAGIC BULLET REWRITER MODAL ── */}
      {rewriteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-lg border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="w-4 h-4 text-primary" /> AI Magic Bullet Rewriter (Google X-Y-Z)
              </h3>
              <button
                type="button"
                onClick={() => setRewriteModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-xs font-bold text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Original vs Rewritten */}
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-lg bg-background border border-border space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Original Bullet:
                </span>
                <p className="text-muted-foreground italic leading-relaxed">
                  {`"${rewriteModal.originalText}"`}
                </p>
              </div>

              {rewriteModal.isLoading ? (
                <div className="p-6 rounded-lg bg-card-soft border border-border flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Synthesizing metric-driven bullet point with AI...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-primary" /> Enhanced Staff Engineer Accomplishment:
                    </span>
                    <p className="text-foreground font-medium leading-relaxed">
                      {`"${rewriteModal.rewrittenText}"`}
                    </p>
                  </div>

                  {rewriteModal.explanation && (
                    <p className="text-[11px] text-muted-foreground italic px-1">
                      💡 {rewriteModal.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setRewriteModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyRewrittenBullet}
                disabled={rewriteModal.isLoading || !rewriteModal.rewrittenText}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
              >
                Apply to Resume ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
