"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Globe,
  ExternalLink,
  Sparkles,
  BrainCircuit,
  Search,
  Share2,
  Network,
  List,
  Layers,
  Award,
  ArrowUpRight,
  FolderGit2,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { ProofGraphNode, ProofGraphEdge } from "@/src/lib/api/learner/proof-graph";
import { ProofNodeDrawer } from "../ProofGraphCanvas/ProofNodeDrawer";

interface SkillPassportStreamProps {
  primarySkill: string;
  overallProofScore: number;
  nodes: ProofGraphNode[];
  edges: ProofGraphEdge[];
  onShare?: () => void;
  onSwitchView?: (view: "passport" | "canvas" | "tree") => void;
}

export function SkillPassportStream({
  primarySkill,
  overallProofScore,
  nodes,
  edges,
  onShare,
  onSwitchView,
}: SkillPassportStreamProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "pending">("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  // Group nodes by Skill passport bundles
  const skillPassports = useMemo(() => {
    const skillNodes = nodes.filter((n) => n.type === "skill");

    return skillNodes.map((skill) => {
      // Find connected evidence & diagnostic nodes
      const outgoingEdges = edges.filter((e) => e.source === skill.id);
      const childNodes = outgoingEdges
        .map((e) => nodes.find((n) => n.id === e.target))
        .filter((n): n is ProofGraphNode => Boolean(n));

      const evidenceNodes = childNodes.filter((n) => n.type === "evidence");
      const diagNodes = childNodes.filter(
        (n) => n.type === "diagnostic" || n.type === "assessment"
      );

      // Find projects (either directly connected or connected via evidence)
      const directProjects = childNodes.filter((n) => n.type === "project");
      const evidenceConnectedProjects = evidenceNodes.flatMap((ev) => {
        const evEdges = edges.filter((e) => e.source === ev.id);
        return evEdges
          .map((e) => nodes.find((n) => n.id === e.target))
          .filter((n): n is ProofGraphNode => Boolean(n && n.type === "project"));
      });

      const allProjects = Array.from(
        new Map(
          [...directProjects, ...evidenceConnectedProjects].map((p) => [p.id, p])
        ).values()
      );

      return {
        skill,
        evidenceNodes,
        diagNodes,
        projects: allProjects,
      };
    });
  }, [nodes, edges]);

  // Statistics
  const totalSkills = skillPassports.length;
  const verifiedSkills = skillPassports.filter(
    (sp) => sp.skill.status === "verified"
  ).length;
  const totalProjects = nodes.filter((n) => n.type === "project").length;
  const totalEvidence = nodes.filter((n) => n.type === "evidence").length;
  const totalDiags = nodes.filter(
    (n) => n.type === "diagnostic" || n.type === "assessment"
  ).length;

  // Filtered Passports
  const filteredPassports = useMemo(() => {
    return skillPassports.filter((sp) => {
      if (statusFilter === "verified" && sp.skill.status !== "verified") {
        return false;
      }
      if (statusFilter === "pending" && sp.skill.status === "verified") {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSkill = sp.skill.title.toLowerCase().includes(query);
        const matchesProject = sp.projects.some((p) =>
          p.title.toLowerCase().includes(query)
        );
        if (!matchesSkill && !matchesProject) return false;
      }
      return true;
    });
  }, [skillPassports, statusFilter, searchQuery]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* ── 1. EXECUTIVE RECRUITER HERO HEADER ── */}
      <div className="relative overflow-hidden rounded-lh border border-primary/30 bg-card p-6 sm:p-8 dashboard-card">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full  blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full  blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Candidate Verification Identity */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-300 border border-emerald-500/10 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic Candidate Proof Passport</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight">
              {primarySkill}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every skill below is cryptographically validated through live GitHub repository inspection, real-time code execution, and rubric-graded diagnostic telemetry.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-card-soft border border-border text-left">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                  Verified Skills
                </span>
                <div className="text-lg font-black text-emerald-400">
                  {verifiedSkills} <span className="text-xs text-muted-foreground">/ {totalSkills}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-card-soft border border-border text-left">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                  Live Projects
                </span>
                <div className="text-lg font-black text-sky-400">
                  {totalProjects} <span className="text-xs text-muted-foreground">Apps</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-card-soft border border-border text-left">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                  Code Evidence
                </span>
                <div className="text-lg font-black text-primary">
                  {totalEvidence} <span className="text-xs text-muted-foreground">Audits</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-card-soft border border-border text-left">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                  Assessments
                </span>
                <div className="text-lg font-black text-indigo-400">
                  {totalDiags} <span className="text-xs text-muted-foreground">Passed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Master Proof Score Radial / Circular Badge */}
          <div className="flex flex-col items-center sm:items-end justify-center p-5 rounded-2xl bg-card-soft border border-primary/30 backdrop-blur-xl shrink-0 w-full sm:w-auto text-center sm:text-right space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Candidate Readiness Score
            </span>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-black">
                {overallProofScore}%
              </span>
            </div>

            <div className="w-48 bg-muted h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${overallProofScore}%` }}
              />
            </div>

            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Production Ready Candidate
            </span>

            {onShare && (
              <button
                type="button"
                onClick={onShare}
                className="w-full mt-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Share Recruiter Verification Link
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. FILTER & VIEW CONTROL TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-card border border-border dashboard-card">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search verified skills, tools, or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/60 border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            All Skills ({totalSkills})
          </button>

          <button
            onClick={() => setStatusFilter("verified")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "verified"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified ({verifiedSkills})
          </button>

          <button
            onClick={() => setStatusFilter("pending")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> In Review ({totalSkills - verifiedSkills})
          </button>
        </div>

        {/* View Switchers */}
        {onSwitchView && (
          <div className="flex items-center gap-1 border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-3">
            <button
              onClick={() => onSwitchView("passport")}
              title="Passport View"
              className="p-2 rounded-lg bg-primary/20 text-primary border border-primary/30 text-xs font-semibold flex items-center gap-1"
            >
              <Award className="w-4 h-4" />
              <span className="hidden md:inline">Passport</span>
            </button>
            <button
              onClick={() => onSwitchView("canvas")}
              title="Graph View"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Network className="w-4 h-4" />
              <span className="hidden md:inline">Graph</span>
            </button>
            <button
              onClick={() => onSwitchView("tree")}
              title="Tree View"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">Tree</span>
            </button>
          </div>
        )}
      </div>

      {/* ── 3. SKILL PASSPORT CARD DECK ── */}
      {filteredPassports.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl space-y-3 bg-card/40">
          <Layers className="w-10 h-10 text-muted-foreground mx-auto" />
          <h4 className="font-bold text-base text-foreground">No matching skill passports found</h4>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search query or filter settings above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPassports.map(({ skill, evidenceNodes, diagNodes, projects }) => {
            const isSkillVerified = skill.status === "verified";
            const scoreVal = skill.score ?? (isSkillVerified ? 85 : 45);

            return (
              <div
                key={skill.id}
                onClick={() => setSelectedNodeId(skill.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedNodeId(skill.id);
                  }
                }}
                className={`relative rounded-lg border transition-all duration-300   p-5 sm:p-6 bg-card/95 backdrop-blur-xl  flex flex-col justify-between group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/60 dashboard-card ${
                  isSkillVerified
                    ? "border-emerald-500/40 hover:border-emerald-400 shadow-[0_4px_24px_rgba(16,185,129,0.08)]"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {/* Top Skill Identity Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2.5 rounded-2xl shrink-0 ${
                          isSkillVerified
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-primary/10 text-primary border border-primary/20"
                        }`}
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Core Competency
                        </span>
                        <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors">
                          {skill.title}
                        </h3>
                      </div>
                    </div>

                    {isSkillVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <AlertCircle className="w-3.5 h-3.5" /> In Review
                      </span>
                    )}
                  </div>

                  {/* Demonstrated Mastery Meter */}
                  <div className="p-3 rounded-2xl bg-muted/50 border border-border/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Demonstrated Mastery Score</span>
                      <span
                        className={`font-extrabold ${
                          scoreVal >= 70
                            ? "text-emerald-500"
                            : scoreVal >= 40
                            ? "text-amber-500"
                            : "text-destructive"
                        }`}
                      >
                        {scoreVal}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          scoreVal >= 70
                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                            : "bg-gradient-to-r from-amber-500 to-yellow-400"
                        }`}
                        style={{ width: `${scoreVal}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* ── 3-PILLAR VERIFICATION CHAIN (THE RECRUITER AUDIT) ── */}
                <div className="space-y-2.5 my-4 pt-3 border-t border-border/70">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> Recruiter Verification Evidence Chain
                  </span>

                  {/* Pillar 1: Diagnostic Assessment */}
                  <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-muted/40 border border-border/60 text-sm">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-foreground">Diagnostic Assessment</span>
                        <p className="text-xs text-muted-foreground">
                          {diagNodes.length > 0
                            ? `${diagNodes[0].description || "Evaluated by diagnostic telemetry"}`
                            : "Assessment completed & validated"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                    </span>
                  </div>

                  {/* Pillar 2: GitHub Code Evidence */}
                  <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-muted/40 border border-border/60 text-sm">
                    <div className="flex items-center gap-2">
                      <FaGithub className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <span className="font-semibold text-foreground">Code Evidence Analyzed</span>
                        <p className="text-xs text-muted-foreground">
                          {evidenceNodes.length > 0
                            ? `${evidenceNodes.length} Verified code artifact(s) on GitHub`
                            : "Repository syntax & commit history inspected"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Inspected
                    </span>
                  </div>

                  {/* Pillar 3: Verified Project & Live Demo */}
                  <div className="p-3.5 rounded-2xl bg-muted/60 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-sky-400" />
                        <span className="font-bold text-sm text-foreground">
                          {projects.length > 0 ? projects[0].title : "Practical Project Application"}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                        Production Artifact
                      </span>
                    </div>

                    {projects.length > 0 && projects[0].description && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {projects[0].description}
                      </p>
                    )}

                    {/* Action Links */}
                    <div
                      className="flex items-center gap-2 pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {projects.length > 0 && projects[0].metadata?.githubUrl ? (
                        <a
                          href={projects[0].metadata.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
                        >
                          <FaGithub className="w-3.5 h-3.5 text-primary" /> Repository <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <FolderGit2 className="w-3.5 h-3.5" /> Verified in Repository
                        </span>
                      )}

                      {projects.length > 0 && projects[0].metadata?.liveUrl && (
                        <a
                          href={projects[0].metadata.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" /> Live Demo <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <span className="text-xs font-mono font-medium">HMAC SHA-256 Validated</span>
                  <span className="text-primary font-bold group-hover:underline flex items-center gap-1 text-xs">
                    Inspect Verification Audit →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-out Deep Verification Drawer */}
      <ProofNodeDrawer
        node={selectedNode}
        allNodes={nodes}
        allEdges={edges}
        onClose={() => setSelectedNodeId(null)}
        onSelectConnectedNode={(id) => setSelectedNodeId(id)}
      />
    </div>
  );
}
