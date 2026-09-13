"use client";

import React, { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
  FolderKanban,
  ExternalLink,
  Loader2,
  Lock,
  Video,
  FileText,
  Code2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMilestoneResources, MilestoneResourcesResponse } from "@/src/lib/api/learner/learning-path";
import Link from "next/link";

const emptySubscribe = () => () => {};

interface MilestoneDetailDrawerProps {
  milestone: {
    id: string;
    title: string;
    status: "completed" | "current" | "upcoming";
    progress?: number;
    skillsCovered: string[];
    estimatedTime: string;
    description: string;
    whyItMatters: string;
    phase?: string;
  } | null;
  onClose: () => void;
  onComplete: (milestoneId: string) => void;
  isCompleting: boolean;
  onGenerateProject: (opts: { milestoneId: string; skill?: string }) => void;
  isGeneratingProject: boolean;
}

export function MilestoneDetailDrawer({
  milestone,
  onClose,
  onComplete,
  isCompleting,
  onGenerateProject,
  isGeneratingProject,
}: MilestoneDetailDrawerProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);

  const showResources = Boolean(milestone?.id && expandedMilestoneId === milestone.id);

  const {
    data: resourceResp,
    isLoading: isLoadingResources,
    isError: isResourceError,
  } = useQuery<MilestoneResourcesResponse>({
    queryKey: ["milestoneResources", milestone?.id],
    queryFn: () =>
      milestone
        ? getMilestoneResources(milestone.id)
        : Promise.resolve({ success: false, data: { milestoneTitle: "", resources: [] } }),
    enabled: Boolean(milestone?.id) && showResources,
    staleTime: 1000 * 60 * 10,
  });

  if (!milestone || !isClient) return null;

  const isCompleted = milestone.status === "completed";
  const isCurrent = milestone.status === "current";
  const resources = resourceResp?.data?.resources || [];

  const drawerContent = (
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Backdrop Click to Close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-out Drawer Panel (Fixed height with flex column and min-h-0 for smooth scrolling) */}
      <div className="relative w-full max-w-xl h-full max-h-screen bg-card border-l border-border flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
        {/* 1. Fixed Header */}
        <div className="shrink-0 p-6 pb-4 border-b border-border bg-card-soft">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  isCompleted
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : isCurrent
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {isCompleted
                  ? "Completed"
                  : isCurrent
                    ? "Active Learning Frontier"
                    : "Upcoming Prerequisite"}
              </span>
              {milestone.phase && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  {milestone.phase.replace(/_/g, " ")}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title & Estimated Time */}
          <div className="space-y-1.5">
            <h2 className="text-xl md:text-2xl font-black text-foreground leading-snug">
              {milestone.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Estimated: <strong className="text-foreground">{milestone.estimatedTime}</strong>
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                Skills: <strong className="text-foreground">{milestone.skillsCovered.length} Topics</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 2. Scrollable Body with min-h-0, overscroll-contain, and custom scrollbar */}
        <div
          className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5 overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Overview & Learning Objectives */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Overview & Learning Objectives
            </h3>
            <p className="text-sm text-foreground leading-relaxed bg-card-soft p-4 rounded-xl border border-border">
              {milestone.description}
            </p>
          </div>

          {/* Why It Matters */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Why It Matters in Industry
            </h3>
            <p className="text-sm text-foreground leading-relaxed bg-primary/10 p-4 rounded-xl border border-primary/20">
              {milestone.whyItMatters}
            </p>
          </div>

          {/* Skills Covered Tags */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Core Competencies Covered
            </h3>
            <div className="flex flex-wrap gap-2">
              {milestone.skillsCovered.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted text-foreground border border-border"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Click-to-Load Curated Resources Accordion */}
          <div className="pt-2 pb-4">
            <button
              type="button"
              onClick={() =>
                setExpandedMilestoneId(showResources ? null : milestone.id)
              }
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-card-soft border border-border hover:border-primary/40 hover:bg-muted transition-all text-xs font-semibold text-foreground group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                {showResources
                  ? "Hide Curated Learning Resources"
                  : "Explore Curated Learning Resources"}
              </span>
              <span className="text-muted-foreground text-[11px] font-normal flex items-center gap-1 group-hover:text-primary transition-colors">
                {showResources ? "Collapse" : "Click to Load"}
                {showResources ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {showResources && (
              <div className="mt-3 space-y-2.5 animate-in fade-in duration-300">
                {isLoadingResources ? (
                  <div className="p-6 flex items-center justify-center gap-2 text-muted-foreground text-sm bg-muted rounded-xl border border-border">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Fetching verified official tutorials & docs...
                  </div>
                ) : isResourceError ? (
                  <div className="p-4 text-xs text-rose-500 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    Unable to load external resources at this time. Please try again.
                  </div>
                ) : resources.length === 0 ? (
                  <div className="p-4 text-xs text-muted-foreground bg-muted rounded-xl border border-border">
                    Interactive resources for this module are being curated.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start justify-between gap-3 p-3.5 rounded-xl bg-card-soft border border-border hover:border-primary/50 hover:bg-muted transition-all text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-muted text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                            {res.type?.toLowerCase().includes("video") ||
                            res.type?.toLowerCase().includes("course") ? (
                              <Video className="w-3.5 h-3.5" />
                            ) : res.type?.toLowerCase().includes("doc") ? (
                              <Code2 className="w-3.5 h-3.5" />
                            ) : (
                              <FileText className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {res.title}
                            </h4>
                            <span className="text-[11px] text-muted-foreground">
                              {res.provider} • {res.difficulty || res.type || "Official Guide"}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Sticky Action Footer */}
        <div className="shrink-0 p-6 pt-4 border-t border-border bg-card-soft space-y-3">
          {isCurrent ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onGenerateProject({ milestoneId: milestone.id })}
                disabled={isGeneratingProject}
                className="w-full bg-muted hover:bg-muted/80 text-foreground font-medium py-3 px-4 rounded-xl border border-border text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingProject ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    Generating Spec...
                  </>
                ) : (
                  <>
                    <FolderKanban className="w-3.5 h-3.5 text-primary" />
                    Build Milestone Project
                  </>
                )}
              </button>

              <button
                onClick={() => onComplete(milestone.id)}
                disabled={isCompleting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    Marking Complete...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    Mark Milestone Complete
                  </>
                )}
              </button>
            </div>
          ) : isCompleted ? (
            <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 dark:text-emerald-300">
              <span className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> You have completed this milestone!
              </span>
              <Link
                href="/dashboard/learner/portfolio"
                className="text-emerald-500 dark:text-emerald-400 hover:underline font-bold shrink-0"
              >
                View Projects
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-card-soft border border-border text-xs text-muted-foreground">
              <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>Complete the active milestone to unlock completion for this stage.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(drawerContent, document.body) : null;
}
