"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import {
  getProofGraph,
  ProofGraphNode,
  generateProofGraphShareLink,
} from "@/src/lib/api/learner/proof-graph";
import {
  getGamificationProfile,
  getSkillTree,
} from "@/src/lib/api/learner/gamification";
import { useQuery } from "@tanstack/react-query";
import GenericPageSkeleton from "../../../shared/GenericPageSkeleton";
import DashboardButton from "@/src/components/dashboard/shared/patterns/DashboardButton/DashboardButton";
import { Card, CardContent } from "@/src/components/ui/Card";
import { DashboardCard } from "@/src/components/dashboard/shared/cards";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle,
  ShieldCheck,
  FileCode,
  CheckSquare,
  BrainCircuit,
  Activity,
  Users,
  Trophy,
  Sparkles,
  Award,
  Flag,
  FolderGit2,
  Lock,
  GitMerge,
  Zap,
  Share2,
  Copy,
  Check,
  Loader2,
  X,
} from "lucide-react";

export default function ProofGraphPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();
  const [activeTab, setActiveTab] = useState<
    "proof-graph" | "skill-tree" | "achievements"
  >("proof-graph");

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShareProofGraph = async () => {
    try {
      setIsSharing(true);
      const res = await generateProofGraphShareLink();
      const url = `${window.location.origin}/verify/proof/${res.shareToken}`;
      setShareUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate share link.";
      alert(msg);
    } finally {
      setIsSharing(false);
    }
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["proofGraph", session?.user?.id],
    queryFn: () => getProofGraph(),
    enabled: !!session?.user?.id,
  });

  const { data: gamificationData } = useQuery({
    queryKey: ["gamificationProfile", session?.user?.id],
    queryFn: () => getGamificationProfile(),
    enabled: !!session?.user?.id,
  });

  const { data: skillTreeData } = useQuery({
    queryKey: ["skillTree", session?.user?.id],
    queryFn: () => getSkillTree(),
    enabled: !!session?.user?.id,
  });

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
        <p className="text-muted-foreground">Failed to load proof graph.</p>
        <DashboardButton text="Retry" radius="md" onClick={() => refetch()} />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "pending":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "missing":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "skill":
        return <ShieldCheck className="w-6 h-6" />;
      case "knowledge":
        return <BrainCircuit className="w-6 h-6" />;
      case "practice":
        return <Activity className="w-6 h-6" />;
      case "diagnostic":
      case "assessment":
        return <CheckSquare className="w-6 h-6" />;
      case "project":
        return <FileCode className="w-6 h-6" />;
      case "evidence":
        return <ShieldCheck className="w-6 h-6" />;
      case "interview":
        return <Users className="w-6 h-6" />;
      default:
        return <Circle className="w-6 h-6" />;
    }
  };

  const getBadgeIcon = (badgeIcon: string) => {
    switch (badgeIcon) {
      case "BrainCircuit":
        return <BrainCircuit className="w-6 h-6 text-indigo-500" />;
      case "Flag":
        return <Flag className="w-6 h-6 text-blue-500" />;
      case "FolderGit2":
        return <FolderGit2 className="w-6 h-6 text-emerald-500" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-6 h-6 text-teal-500" />;
      case "Users":
        return <Users className="w-6 h-6 text-amber-500" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6 text-purple-500" />;
      case "Trophy":
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case "Award":
        return <Award className="w-6 h-6 text-rose-500" />;
      default:
        return <Award className="w-6 h-6 text-primary" />;
    }
  };

  const renderNode = (
    node: ProofGraphNode,
    indentLevel: number = 0,
    isLast: boolean = true,
  ) => {
    return (
      <div
        key={node.id}
        className={`relative flex items-stretch mt-4 ${indentLevel > 0 ? "ml-8" : ""}`}
      >
        {indentLevel > 0 && (
          <div className="absolute -left-6 top-6 w-6 h-px bg-border" />
        )}
        {indentLevel > 0 && !isLast && (
          <div className="absolute -left-6 top-6 bottom-[-24px] w-px bg-border" />
        )}
        {indentLevel > 0 && isLast && (
          <div className="absolute -left-6 top-0 h-6 w-px bg-border" />
        )}

        <Card
          className={`w-full max-w-sm transition-all hover:border-primary/50 relative z-10 bg-card/95 shadow-sm ${
            node.status === "verified"
              ? "border-green-500/30"
              : node.status === "missing"
                ? "border-destructive/30"
                : "border-amber-500/30"
          }`}
        >
          <CardContent className="p-4 flex gap-4 items-start">
            <div
              className={`p-2 rounded-lg shrink-0 mt-1 ${
                node.status === "verified"
                  ? "bg-green-500/10 text-green-500"
                  : node.status === "missing"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-amber-500/10 text-amber-500"
              }`}
            >
              {getTypeIcon(node.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {node.type}
                </span>
                {getStatusIcon(node.status)}
              </div>
              <h3 className="font-bold text-foreground truncate">
                {node.title}
              </h3>
              {node.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {node.description}
                </p>
              )}
              {node.score !== undefined && (
                <div className="mt-2 text-sm font-medium">
                  Score:{" "}
                  <span
                    className={
                      node.score > 70 ? "text-green-500" : "text-amber-500"
                    }
                  >
                    {node.score}%
                  </span>
                </div>
              )}
              {node.metadata && (
                <div className="mt-2 flex gap-2">
                  {node.metadata.githubUrl && (
                    <a
                      href={node.metadata.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      GitHub
                    </a>
                  )}
                  {node.metadata.liveUrl && (
                    <a
                      href={node.metadata.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const getChildren = (nodeId: string) => {
    return data.edges
      .filter((edge) => edge.source === nodeId)
      .map((edge) => data.nodes.find((n) => n.id === edge.target)!)
      .filter(Boolean);
  };

  const renderTree = (
    node: ProofGraphNode,
    indentLevel: number = 0,
    isLast: boolean = true,
  ) => {
    const children = getChildren(node.id);
    return (
      <div key={`tree-${node.id}`} className="relative">
        {renderNode(node, indentLevel, isLast)}
        {children.length > 0 && (
          <div className="relative">
            {indentLevel === 0 && (
              <div className="absolute left-[34px] top-0 bottom-0 w-px bg-border" />
            )}
            {children.map((child, idx) =>
              renderTree(child, indentLevel + 1, idx === children.length - 1),
            )}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = data.nodes.filter(
    (node) => !data.edges.some((edge) => edge.target === node.id),
  );

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Skill Tree & Proof Graph
          </h1>
          <p className="text-muted-foreground">
            Trace verified competence, unlock mastery nodes, and earn career
            badges.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleShareProofGraph}
            disabled={isSharing}
            className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
          >
            {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            {isSharing ? "Generating..." : "Share Proof Graph"}
          </button>

          {/* View Tabs */}
          <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-lg border">
          <button
            onClick={() => setActiveTab("proof-graph")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "proof-graph"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GitMerge className="w-4 h-4" />
            Proof Graph
          </button>
          <button
            onClick={() => setActiveTab("skill-tree")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "skill-tree"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Skill Tree
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "achievements"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Achievements
          </button>
        </div>
      </div>
    </div>

      {/* Level & Proof Banner */}
      <DashboardCard className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              Analyzing Career Target
            </p>
            <h2 className="text-2xl font-bold text-primary flex items-center justify-center md:justify-start gap-2">
              {data.primarySkill}
            </h2>
            {gamificationData?.levelInfo && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">
                  Level {gamificationData.levelInfo.level}:
                </span>
                <span>{gamificationData.levelInfo.title}</span>
              </div>
            )}
          </div>

          {gamificationData?.levelInfo && (
            <div className="flex-1 max-w-xs w-full">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1 text-primary">
                  <Zap className="w-3.5 h-3.5" />{" "}
                  {gamificationData.totalXp ?? 0} XP
                </span>
                <span className="text-muted-foreground">
                  {gamificationData.levelInfo.nextLevelXp} XP (Lvl{" "}
                  {gamificationData.levelInfo.level + 1})
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${gamificationData.levelInfo.progressPercent ?? 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground mb-1">
              Overall Proof Score
            </p>
            <div className="text-3xl font-bold text-foreground">
              {data.overallProofScore}%
            </div>
          </div>
        </CardContent>
      </DashboardCard>

      {/* TAB 1: PROOF GRAPH */}
      {activeTab === "proof-graph" && (
        <div className="mx-auto w-full max-w-4xl py-4 flex flex-col gap-8">
          {rootNodes.length === 0 ||
          data.nodes.find((n) => n.id === "empty-state-node") ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl">
              <ShieldCheck className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">
                No proof available yet.
              </h3>
              <p className="text-muted-foreground max-w-md">
                Complete assessments, build projects, and add verified evidence
                to build your proof graph.
              </p>
            </div>
          ) : (
            rootNodes.map((rootNode, i) =>
              renderTree(rootNode, 0, i === rootNodes.length - 1),
            )
          )}
        </div>
      )}

      {/* TAB 2: SKILL TREE */}
      {activeTab === "skill-tree" && (
        <div className="w-full space-y-6">
          {skillTreeData && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 border-green-500/20 bg-green-500/5">
                  <p className="text-xs text-muted-foreground font-semibold">
                    MASTERED
                  </p>
                  <p className="text-2xl font-bold text-green-500">
                    {skillTreeData.masteredCount}
                  </p>
                </Card>
                <Card className="p-4 border-amber-500/20 bg-amber-500/5">
                  <p className="text-xs text-muted-foreground font-semibold">
                    IN PROGRESS
                  </p>
                  <p className="text-2xl font-bold text-amber-500">
                    {skillTreeData.inProgressCount}
                  </p>
                </Card>
                <Card className="p-4 border-blue-500/20 bg-blue-500/5">
                  <p className="text-xs text-muted-foreground font-semibold">
                    AVAILABLE
                  </p>
                  <p className="text-2xl font-bold text-blue-500">
                    {skillTreeData.availableCount}
                  </p>
                </Card>
                <Card className="p-4 border-muted">
                  <p className="text-xs text-muted-foreground font-semibold">
                    LOCKED
                  </p>
                  <p className="text-2xl font-bold text-muted-foreground">
                    {skillTreeData.lockedCount}
                  </p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillTreeData.nodes.map((node) => (
                  <Card
                    key={node.id}
                    className={`transition-all ${
                      node.status === "MASTERED"
                        ? "border-green-500/40 bg-green-500/5"
                        : node.status === "IN_PROGRESS"
                          ? "border-amber-500/40 bg-amber-500/5"
                          : node.status === "AVAILABLE"
                            ? "border-blue-500/40 bg-blue-500/5"
                            : "border-border opacity-70 bg-card/40"
                    }`}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {node.category}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            node.status === "MASTERED"
                              ? "bg-green-500/20 text-green-500"
                              : node.status === "IN_PROGRESS"
                                ? "bg-amber-500/20 text-amber-500"
                                : node.status === "AVAILABLE"
                                  ? "bg-blue-500/20 text-blue-500"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {node.status === "LOCKED" && (
                            <Lock className="w-3 h-3 inline mr-1" />
                          )}
                          {node.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-foreground">
                        {node.name}
                      </h3>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Mastery Score</span>
                          <span className="font-bold">
                            {node.masteryScore}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              node.masteryScore >= 70
                                ? "bg-green-500"
                                : "bg-amber-500"
                            }`}
                            style={{
                              width: `${Math.min(100, node.masteryScore)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
                        <div>
                          Knowledge:{" "}
                          <span className="font-semibold text-foreground">
                            {node.knowledgeScore}%
                          </span>
                        </div>
                        <div>
                          Evidence:{" "}
                          <span className="font-semibold text-foreground">
                            {node.evidenceScore}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: ACHIEVEMENTS & BADGES */}
      {activeTab === "achievements" && (
        <div className="w-full space-y-6">
          {gamificationData && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    Earned Badges ({gamificationData.unlockedCount ?? 0}/
                    {gamificationData.totalAchievementsCount ?? 0})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock career achievements through real proof and milestone
                    accomplishments.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(gamificationData.achievements || []).map((ach) => (
                  <Card
                    key={ach.code}
                    className={`transition-all ${
                      ach.isUnlocked
                        ? "border-primary/40 bg-primary/5 shadow-sm"
                        : "border-border opacity-50 bg-card/40"
                    }`}
                  >
                    <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                      <div
                        className={`p-3 rounded-2xl ${
                          ach.isUnlocked ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        {getBadgeIcon(ach.badgeIcon)}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">
                          {ach.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {ach.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary mt-auto pt-2">
                        <Zap className="w-3.5 h-3.5" />
                        <span>+{ach.xpReward} XP</span>
                      </div>
                      {ach.isUnlocked ? (
                        <span className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* SHARE PROOF GRAPH MODAL */}
      {shareUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Public Verified Proof Link</h3>
              </div>
              <button
                type="button"
                onClick={() => setShareUrl(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Share this cryptographic verification link with recruiters, hiring managers, and mentors. This read-only link displays your verified competencies and evidence without exposing private account information or personal details.
            </p>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/60 border border-border">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-xs text-foreground px-2 py-1 outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:opacity-90 transition-opacity shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShareUrl(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
