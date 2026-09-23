"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { CheckCircle2, Lock, Sparkles, ArrowRight, Target } from "lucide-react";

export interface RoadmapMilestoneNodeData {
  id: string;
  order: number;
  title: string;
  status: "completed" | "current" | "upcoming";
  progress?: number;
  skillsCovered: string[];
  estimatedTime: string;
  description: string;
  whyItMatters: string;
  phase?: string;
  isTarget?: boolean;
  onSelectNode: (milestoneId: string) => void;
}

function RoadmapMilestoneNodeComponent({ data }: { data: RoadmapMilestoneNodeData }) {
  const isCompleted = data.status === "completed";
  const isCurrent = data.status === "current";
  const isUpcoming = data.status === "upcoming";

  return (
    <div
      onClick={() => data.onSelectNode(data.id)}
      className={`relative w-72 rounded-xl p-4 transition-all duration-300 cursor-pointer select-none backdrop-blur-md ${
        data.isTarget
          ? "bg-card border-2 border-primary ring-4 ring-primary/40"
          : isCompleted
            ? "bg-card border-2 border-primary/80 hover:border-primary"
            : isCurrent
              ? "bg-card border-2 border-primary ring-2 ring-primary/30 animate-pulse-subtle"
              : "bg-card border border-border hover:border-primary/50 hover:bg-card-soft"
      }`}
    >
      {data.isTarget && (
        <div className="mb-2.5 py-1 px-2.5 rounded-lg bg-primary/15 border border-primary/50 text-primary text-xs font-bold flex items-center gap-1.5 animate-pulse">
          <Target className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>🎯 TARGET SKILL GAP FOCUS</span>
        </div>
      )}
      {/* React Flow Handles for multi-directional connection */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary !border-2 !border-card rounded-full transition-transform hover:scale-125"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-primary !border-2 !border-card rounded-full transition-transform hover:scale-125"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-card rounded-full transition-transform hover:scale-125"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-primary !border-2 !border-card rounded-full transition-transform hover:scale-125"
      />

      {/* Header Badges */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
              isCompleted
                ? "bg-primary text-white font-extrabold"
                : isCurrent
                  ? "bg-primary text-white font-extrabold"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : isUpcoming ? (
              <Lock className="w-3 h-3" />
            ) : (
              data.order
            )}
          </span>
          <span
            className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              isCompleted
                ? "bg-primary/20 text-primary"
                : isCurrent
                  ? "bg-primary/20 text-primary font-semibold"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Locked"}
          </span>
        </div>

        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          {data.estimatedTime}
        </span>
      </div>

      {/* Node Title */}
      <h4
        className={`text-base font-bold line-clamp-2 leading-tight mb-1.5 ${
          isCompleted ? "text-primary" : isCurrent ? "text-primary" : "text-foreground"
        }`}
      >
        {data.title}
      </h4>

      {/* Node Description Preview */}
      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
        {data.description}
      </p>

      {/* Skills Pill Tags */}
      {data.skillsCovered && data.skillsCovered.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {data.skillsCovered.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded bg-muted text-foreground border border-border truncate max-w-[120px] font-medium"
            >
              {skill}
            </span>
          ))}
          {data.skillsCovered.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
              +{data.skillsCovered.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
        {isUpcoming ? (
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> View module
          </span>
        ) : (
          <span className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1">
            Learn more <ArrowRight className="w-3.5 h-3.5" />
          </span>
        )}

        {isCompleted && (
          <span className="text-xs text-primary font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        )}
        {isCurrent && (
          <span className="text-xs text-primary font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Active Frontier
          </span>
        )}
        {isUpcoming && (
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            <Lock className="w-3 h-3" /> Locked
          </span>
        )}
      </div>
    </div>
  );
}

export const RoadmapMilestoneNode = memo(RoadmapMilestoneNodeComponent);
