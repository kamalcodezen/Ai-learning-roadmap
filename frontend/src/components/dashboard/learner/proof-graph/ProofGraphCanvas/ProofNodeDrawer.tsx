"use client";

import React, { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Globe,
  ExternalLink,
  Sparkles,
  BrainCircuit,
  Users,
  Award,
  Lock,
  ArrowRight,
  Layers,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { ProofGraphNode, ProofGraphEdge } from "@/src/lib/api/learner/proof-graph";

const emptySubscribe = () => () => {};

interface ProofNodeDrawerProps {
  node: ProofGraphNode | null;
  allNodes: ProofGraphNode[];
  allEdges: ProofGraphEdge[];
  onClose: () => void;
  onSelectConnectedNode?: (nodeId: string) => void;
}

export function ProofNodeDrawer({
  node,
  allNodes,
  allEdges,
  onClose,
  onSelectConnectedNode,
}: ProofNodeDrawerProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!node || !isClient) return null;

  const isVerified = node.status === "verified";
  const isPending = node.status === "pending";

  // Find outbound and inbound relationships
  const outboundEdges = allEdges.filter((e) => e.source === node.id);
  const inboundEdges = allEdges.filter((e) => e.target === node.id);

  const outboundNodes = outboundEdges
    .map((edge) => ({
      edge,
      targetNode: allNodes.find((n) => n.id === edge.target),
    }))
    .filter((item): item is { edge: ProofGraphEdge; targetNode: ProofGraphNode } => Boolean(item.targetNode));

  const inboundNodes = inboundEdges
    .map((edge) => ({
      edge,
      sourceNode: allNodes.find((n) => n.id === edge.source),
    }))
    .filter((item): item is { edge: ProofGraphEdge; sourceNode: ProofGraphNode } => Boolean(item.sourceNode));

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "skill":
        return <ShieldCheck className="w-5 h-5 text-purple-400" />;
      case "project":
        return <FileCode className="w-5 h-5 text-sky-400" />;
      case "evidence":
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case "diagnostic":
      case "assessment":
        return <BrainCircuit className="w-5 h-5 text-indigo-400" />;
      case "interview":
        return <Users className="w-5 h-5 text-amber-400" />;
      default:
        return <Award className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const drawerContent = (
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Backdrop Click */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl h-full max-h-screen bg-card border-l border-border flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 p-6 pb-4 border-b border-border bg-card-soft">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  isVerified
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : isPending
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {isVerified
                  ? "Cryptographically Verified"
                  : isPending
                  ? "Pending Verification"
                  : "Unverified Competency"}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border uppercase">
                {node.type}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-muted border border-border shrink-0 mt-0.5">
              {getNodeIcon(node.type)}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-black text-foreground leading-snug">
                {node.title}
              </h2>
              <p className="text-xs font-mono text-muted-foreground">Node ID: {node.id}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5 overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Verification Score Meter */}
          {node.score !== undefined && (
            <div className="p-4 rounded-xl bg-card-soft border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground/90">Demonstrated Mastery Score</span>
                <span
                  className={`text-base font-black ${
                    node.score >= 70
                      ? "text-emerald-400"
                      : node.score >= 40
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {node.score}%
                </span>
              </div>
              <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    node.score >= 70
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : node.score >= 40
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                      : "bg-gradient-to-r from-rose-500 to-red-400"
                  }`}
                  style={{ width: `${node.score}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                {node.score >= 70
                  ? "Exceeds production competency threshold (>70%). Validated for recruiter sharing."
                  : "Requires further milestone evidence or assessment to reach mastery threshold."}
              </p>
            </div>
          )}

          {/* Description */}
          {node.description && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Evidence Details & Context
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed bg-card-soft p-4 rounded-xl border border-border">
                {node.description}
              </p>
            </div>
          )}

          {/* Artifact Links (GitHub / Live Demo) */}
          {node.metadata && (node.metadata.githubUrl || node.metadata.liveUrl) && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" /> Verified Artifacts & Source
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {node.metadata.githubUrl && (
                  <a
                    href={node.metadata.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-card-soft border border-border hover:border-primary/50 hover:bg-muted/70 transition-all text-xs text-foreground group"
                  >
                    <div className="flex items-center gap-2">
                      <FaGithub className="w-4 h-4 text-primary" />
                      <span className="font-semibold">GitHub Repository</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                  </a>
                )}
                {node.metadata.liveUrl && (
                  <a
                    href={node.metadata.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-card-soft border border-border hover:border-sky-500/50 hover:bg-muted/70 transition-all text-xs text-foreground group"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span className="font-semibold">Production Demo</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-sky-400" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Proof Integrity Notice */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <ShieldCheck className="w-4 h-4 text-primary" /> Cryptographic Integrity Verification
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This node is backed by automated code analysis, completed assessment telemetry, and rubric milestone validations on AI Pather. Public links contain immutable HMAC signatures ensuring zero tampering.
            </p>
          </div>

          {/* Graph Connections (Outbound) */}
          {outboundNodes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Connected Nodes ({outboundNodes.length})
              </h3>
              <div className="space-y-2">
                {outboundNodes.map(({ edge, targetNode }) => (
                  <button
                    key={targetNode.id}
                    type="button"
                    onClick={() => onSelectConnectedNode?.(targetNode.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-card-soft border border-border hover:border-primary/40 hover:bg-muted/60 transition-all text-left text-xs group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded-lg bg-muted text-foreground">
                        {getNodeIcon(targetNode.type)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {targetNode.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {edge.label ? `Relation: "${edge.label}"` : `Type: ${targetNode.type}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary">
                      <span className="text-[11px] capitalize">{targetNode.status}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Graph Connections (Inbound) */}
          {inboundNodes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Referenced By ({inboundNodes.length})
              </h3>
              <div className="space-y-2">
                {inboundNodes.map(({ edge, sourceNode }) => (
                  <button
                    key={sourceNode.id}
                    type="button"
                    onClick={() => onSelectConnectedNode?.(sourceNode.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-card-soft border border-border hover:border-primary/40 hover:bg-muted/60 transition-all text-left text-xs group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded-lg bg-muted text-foreground">
                        {getNodeIcon(sourceNode.type)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {sourceNode.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {edge.label ? `Relationship: "${edge.label}"` : `Type: ${sourceNode.type}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary">
                      <span className="text-[11px] capitalize">{sourceNode.status}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 p-6 pt-4 border-t border-border bg-card-soft flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isVerified ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Ready for Recruiters
              </span>
            ) : isPending ? (
              <span className="text-amber-400 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-4 h-4" /> Verification in Progress
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 font-semibold">
                <Lock className="w-4 h-4" /> Milestone Locked
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(drawerContent, document.body) : null;
}
