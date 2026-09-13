"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  ShieldCheck,
  FileCode,
  CheckSquare,
  Users,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Globe,
  Sparkles,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

export interface ProofNodeData extends Record<string, unknown> {
  id: string;
  type: string;
  title: string;
  status: "verified" | "pending" | "missing" | string;
  description?: string;
  score?: number;
  metadata?: {
    githubUrl?: string;
    liveUrl?: string;
    [key: string]: unknown;
  };
  onSelectNode?: (nodeId: string) => void;
}

const ProofGraphNode = ({ data }: { data: ProofNodeData }) => {
  const { id, type, title, status, description, score, metadata, onSelectNode } = data;

  const isVerified = status === "verified";
  const isPending = status === "pending";

  // Type configuration
  const getTypeMeta = () => {
    switch (type) {
      case "skill":
        return {
          label: "Core Skill",
          icon: <ShieldCheck className="w-3.5 h-3.5 text-primary" />,
          badgeBg: "bg-primary/10 text-primary border-primary/30",
          headerBg: "from-primary/20 to-transparent",
        };
      case "project":
        return {
          label: "Project",
          icon: <FileCode className="w-3.5 h-3.5 text-sky-400" />,
          badgeBg: "bg-sky-500/10 text-sky-300 border-sky-500/30",
          headerBg: "from-sky-950/40 to-transparent",
        };
      case "evidence":
        return {
          label: "Code Evidence",
          icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
          badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
          headerBg: "from-emerald-950/40 to-transparent",
        };
      case "diagnostic":
      case "assessment":
        return {
          label: "Assessment",
          icon: <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />,
          badgeBg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
          headerBg: "from-indigo-950/40 to-transparent",
        };
      case "interview":
        return {
          label: "Interview",
          icon: <Users className="w-3.5 h-3.5 text-amber-400" />,
          badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
          headerBg: "from-amber-950/40 to-transparent",
        };
      default:
        return {
          label: type,
          icon: <CheckSquare className="w-3.5 h-3.5 text-muted-foreground" />,
          badgeBg: "bg-muted text-muted-foreground border-border",
          headerBg: "from-muted/50 to-transparent",
        };
    }
  };

  const typeMeta = getTypeMeta();

  // Status border style
  const getStatusBorder = () => {
    if (isVerified) return "border-emerald-500/40 hover:border-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.12)]";
    if (isPending) return "border-amber-500/40 hover:border-amber-400 shadow-[0_4px_16px_rgba(251,191,36,0.10)]";
    return "border-rose-500/30 hover:border-rose-400";
  };

  const getStatusBadge = () => {
    if (isVerified) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" /> Verified
        </span>
      );
    }
    if (isPending) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <AlertCircle className="w-3 h-3" /> In Review
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <XCircle className="w-3 h-3" /> Unverified
      </span>
    );
  };

  return (
    <div
      onClick={() => onSelectNode?.(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectNode?.(id);
        }
      }}
      className={`relative w-[280px] rounded-xl bg-card/95 border ${getStatusBorder()} backdrop-blur-xl p-3.5 text-left cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 group focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-xl overflow-hidden`}
    >
      {/* Background Top Gradient Accent */}
      <div className={`absolute top-0 left-0 right-0 h-12 bg-gradient-to-b ${typeMeta.headerBg} pointer-events-none`} />

      {/* Target Handle on Left */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-primary !border-2 !border-card !-left-1.5 transition-all group-hover:scale-125"
      />

      {/* Source Handle on Right */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-primary !border-2 !border-card !-right-1.5 transition-all group-hover:scale-125"
      />

      {/* Header Row */}
      <div className="relative flex items-center justify-between gap-2 mb-2">
        <span
          className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${typeMeta.badgeBg}`}
        >
          {typeMeta.icon}
          {typeMeta.label}
        </span>
        {getStatusBadge()}
      </div>

      {/* Title */}
      <h3 className="relative font-bold text-xs md:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
        {title}
      </h3>

      {/* Short Description */}
      {description && (
        <p className="relative text-[11px] text-muted-foreground mt-1 line-clamp-1 leading-relaxed">
          {description}
        </p>
      )}

      {/* Score and Metadata Footer */}
      <div className="relative mt-2.5 pt-2 border-t border-border flex items-center justify-between gap-2">
        {score !== undefined ? (
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-muted-foreground text-[10px]">Mastery:</span>
            <span
              className={`font-black text-[11px] ${
                score >= 70
                  ? "text-emerald-400"
                  : score >= 40
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {score}%
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground font-mono">Proof Node</span>
        )}

        {/* Action Chips */}
        {metadata && (metadata.githubUrl || metadata.liveUrl) ? (
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {metadata.githubUrl && (
              <a
                href={metadata.githubUrl}
                target="_blank"
                rel="noreferrer"
                title="Open GitHub Repository"
                className="p-1 rounded-md bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary border border-border transition-colors"
              >
                <FaGithub className="w-2.5 h-2.5" />
              </a>
            )}
            {metadata.liveUrl && (
              <a
                href={metadata.liveUrl}
                target="_blank"
                rel="noreferrer"
                title="Open Live Demo"
                className="p-1 rounded-md bg-muted hover:bg-sky-500/20 text-muted-foreground hover:text-sky-400 border border-border transition-colors"
              >
                <Globe className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-primary/80 group-hover:text-primary flex items-center gap-0.5">
            Details <ExternalLink className="w-2.5 h-2.5" />
          </span>
        )}
      </div>
    </div>
  );
};

export default memo(ProofGraphNode);
