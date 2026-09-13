"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Node,
  Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RoadmapMilestoneNode } from "./RoadmapMilestoneNode";
import { MilestoneDetailDrawer } from "./MilestoneDetailDrawer";
import { Target, CheckCircle2, Clock, List } from "lucide-react";

const nodeTypes = {
  milestoneNode: RoadmapMilestoneNode,
};

function TargetFocusHandler({
  targetMilestoneId,
  nodes,
}: {
  targetMilestoneId?: string | null;
  nodes: Node[];
}) {
  const { setCenter } = useReactFlow();

  useEffect(() => {
    if (!targetMilestoneId || nodes.length === 0) return;
    const targetNode = nodes.find((n) => n.id === targetMilestoneId);
    if (targetNode) {
      const timer = setTimeout(() => {
        setCenter(targetNode.position.x + 144, targetNode.position.y + 100, {
          zoom: 1,
          duration: 900,
        });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [targetMilestoneId, nodes, setCenter]);

  return null;
}

interface MilestoneItem {
  id: string;
  title: string;
  status: "completed" | "current" | "upcoming";
  progress?: number;
  skillsCovered: string[];
  estimatedTime: string;
  description: string;
  whyItMatters: string;
  phase?: string;
}

interface RoadmapGraphCanvasProps {
  roadmapTitle: string;
  targetRole: string;
  overallProgress: number;
  milestones: MilestoneItem[];
  targetMilestoneId?: string | null;
  onCompleteMilestone: (milestoneId: string) => void;
  isCompleting: boolean;
  onGenerateProject: (opts: { milestoneId: string; skill?: string }) => void;
  isGeneratingProject: boolean;
  onToggleView?: () => void;
}

export function RoadmapGraphCanvas({
  roadmapTitle,
  targetRole,
  overallProgress,
  milestones,
  targetMilestoneId,
  onCompleteMilestone,
  isCompleting,
  onGenerateProject,
  isGeneratingProject,
  onToggleView,
}: RoadmapGraphCanvasProps) {
  const [userSelectedMilestoneId, setUserSelectedMilestoneId] = useState<string | null>(targetMilestoneId || null);
  const [prevTargetId, setPrevTargetId] = useState<string | null | undefined>(targetMilestoneId);

  // Adjust selected milestone during render when targetMilestoneId prop changes (official React pattern)
  if (targetMilestoneId !== prevTargetId) {
    setPrevTargetId(targetMilestoneId);
    setUserSelectedMilestoneId(targetMilestoneId || null);
  }

  const selectedMilestoneId = userSelectedMilestoneId ?? targetMilestoneId ?? null;

  const selectedMilestone = useMemo(
    () => milestones.find((m) => m.id === selectedMilestoneId) || null,
    [milestones, selectedMilestoneId]
  );

  const handleSelectNode = useCallback((milestoneId: string) => {
    setUserSelectedMilestoneId(milestoneId);
  }, []);

  // Compute Layout: Multi-path connected grid positioning
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Layout coordinates algorithm for rich branching visual like the reference screenshot
    const layoutPositions = [
      { x: 420, y: 60 },   // M1: Top Center (Foundations)
      { x: 120, y: 220 },  // M2: Left Branch
      { x: 720, y: 220 },  // M3: Right Branch
      { x: 420, y: 380 },  // M4: Core Systems Center
      { x: 120, y: 540 },  // M5: Intermediate Left
      { x: 720, y: 540 },  // M6: Intermediate Right
      { x: 420, y: 700 },  // M7: Advanced Architecture Center
      { x: 120, y: 860 },  // M8: Capstone Left
      { x: 720, y: 860 },  // M9: Job Readiness Right
      { x: 420, y: 1020 }, // M10: Production Center
    ];

    milestones.forEach((m, idx) => {
      const pos = layoutPositions[idx] || {
        x: (idx % 2 === 0 ? 200 : 640),
        y: Math.floor(idx / 2) * 220 + 80,
      };

      const isTarget = m.id === targetMilestoneId;

      nodes.push({
        id: m.id,
        type: "milestoneNode",
        position: pos,
        data: {
          id: m.id,
          order: idx + 1,
          title: m.title,
          status: m.status,
          progress: m.progress,
          skillsCovered: m.skillsCovered,
          estimatedTime: m.estimatedTime,
          description: m.description,
          whyItMatters: m.whyItMatters,
          phase: m.phase,
          isTarget,
          onSelectNode: handleSelectNode,
        },
      });

      // Connect sequential dependencies
      if (idx > 0) {
        const prevMilestone = milestones[idx - 1];
        const isPrevCompleted = prevMilestone.status === "completed";
        const isCurrentEdge = m.status === "current" || prevMilestone.status === "current";

        edges.push({
          id: `edge-${prevMilestone.id}-${m.id}`,
          source: prevMilestone.id,
          target: m.id,
          type: "bezier",
          animated: isCurrentEdge,
          style: {
            stroke: isPrevCompleted
              ? "#10b981"
              : isCurrentEdge
                ? "var(--color-primary, #9F54F7)"
                : "var(--color-border, #52525b)",
            strokeWidth: isCurrentEdge ? 3 : 2,
            strokeDasharray: isCurrentEdge ? "5,5" : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isPrevCompleted ? "#10b981" : isCurrentEdge ? "var(--color-primary, #9F54F7)" : "var(--color-border, #52525b)",
            width: 14,
            height: 14,
          },
        });
      }

      // Add secondary cross-branch edges for rich connected graph feel (e.g. M2 -> M4, M3 -> M4)
      if (idx === 3 && milestones.length >= 4) {
        // Connect left branch (M2) and right branch (M3) into Center (M4)
        edges.push({
          id: `edge-branch-m2-${m.id}`,
          source: milestones[1].id,
          target: m.id,
          type: "bezier",
          style: { stroke: "var(--color-border, #3f3f46)", strokeWidth: 1.5 },
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [milestones, targetMilestoneId, handleSelectNode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="relative w-full h-[760px] md:h-[840px] rounded-2xl overflow-hidden border border-border dashboard-card !p-0">
      {/* Top Left Title Card Overlay (Matching the reference screenshot) */}
      <div className="absolute top-6 left-6 z-10 max-w-sm md:max-w-md p-5 rounded-2xl bg-card/95 border border-border backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Target className="w-4 h-4" /> {targetRole} Roadmap
          </div>
          {onToggleView && (
            <button
              onClick={onToggleView}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-all border border-border cursor-pointer"
            >
              <List className="w-3.5 h-3.5" /> List View
            </button>
          )}
        </div>

        <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight leading-snug">
          {roadmapTitle}
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-primary">Description:</strong> Master the complete curriculum for {targetRole}, from core foundations and architectural systems to production capstone delivery.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
          <span className="text-muted-foreground flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-primary" />
            Duration: <strong className="text-foreground">6–9 months</strong>
          </span>
          <span className="text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {overallProgress}% Mastered
          </span>
        </div>

        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full transition-all duration-700"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* React Flow Graph Engine */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        preventScrolling={false}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        zoomActivationKeyCode="Control"
        className="bg-transparent"
      >
        {/* Dynamic Viewport Gliding to Target Node */}
        <TargetFocusHandler targetMilestoneId={targetMilestoneId} nodes={nodes} />

        {/* Grid Background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="var(--color-border, #27272a)"
        />

        {/* Zoom & Pan Controls */}
        <Controls
          className="!bg-card !border !border-border !rounded-xl [&>button]:!bg-card [&>button]:!border-b [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
          showInteractive={false}
        />

        {/* Interactive MiniMap */}
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            const status = (node.data as { status?: string })?.status;
            if (status === "completed") return "#10b981";
            if (status === "current") return "var(--color-primary, #fbbf24)";
            return "var(--color-border, #3f3f46)";
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
          className="!bg-card !border !border-border !rounded-xl overflow-hidden !bottom-6 !right-6 hidden md:flex"
        />
      </ReactFlow>

      {/* Slide-out Milestone Details Drawer */}
      <MilestoneDetailDrawer
        milestone={selectedMilestone}
        onClose={() => setUserSelectedMilestoneId("")}
        onComplete={onCompleteMilestone}
        isCompleting={isCompleting}
        onGenerateProject={onGenerateProject}
        isGeneratingProject={isGeneratingProject}
      />
    </div>
  );
}
