"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import type Lenis from "lenis";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RoadmapMilestoneNode } from "./RoadmapMilestoneNode";
import { MilestoneDetailDrawer } from "./MilestoneDetailDrawer";
import { Target, CheckCircle2, Clock, List, X, ChevronDown } from "lucide-react";

const nodeTypes = {
  milestoneNode: RoadmapMilestoneNode,
};

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
  hasProject?: boolean;
  projectId?: string | null;
}

interface RoadmapGraphCanvasProps {
  roadmapTitle: string;
  targetRole: string;
  overallProgress: number;
  milestones: MilestoneItem[];
  targetMilestoneId?: string | null;
  autoOpenDrawer?: boolean;
  onCompleteMilestone: (milestoneId: string, onSuccess?: () => void) => void;
  isCompleting: boolean;
  onGenerateProject: (opts: { milestoneId: string; skill?: string }, onSuccess?: () => void) => void;
  isGeneratingProject: boolean;
  onToggleView?: () => void;
  getProjectForMilestone?: (milestoneId: string, milestoneTitle: string) => { id: string; name: string } | null;
  targetSkillGap?: string | null;
}

export function RoadmapGraphCanvas({
  roadmapTitle,
  targetRole,
  overallProgress,
  milestones,
  targetMilestoneId,
  autoOpenDrawer = false,
  onCompleteMilestone,
  isCompleting,
  onGenerateProject,
  isGeneratingProject,
  onToggleView,
  getProjectForMilestone,
  targetSkillGap,
}: RoadmapGraphCanvasProps) {
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [userSelectedMilestoneId, setUserSelectedMilestoneId] = useState<string | null>(
    autoOpenDrawer ? targetMilestoneId || null : null
  );
  const [prevTargetId, setPrevTargetId] = useState<string | null | undefined>(
    autoOpenDrawer ? targetMilestoneId : null
  );

  // Adjust selected milestone during render ONLY when autoOpenDrawer is explicitly enabled and target changes
  if (autoOpenDrawer && targetMilestoneId !== prevTargetId) {
    setPrevTargetId(targetMilestoneId);
    setUserSelectedMilestoneId(targetMilestoneId || null);
  }

  const selectedMilestoneId = userSelectedMilestoneId;

  const selectedMilestone = useMemo(
    () => (selectedMilestoneId ? milestones.find((m) => m.id === selectedMilestoneId) || null : null),
    [milestones, selectedMilestoneId]
  );

  const handleSelectNode = useCallback((milestoneId: string) => {
    setUserSelectedMilestoneId(milestoneId);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setUserSelectedMilestoneId(null);
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleComplete = useCallback(
    (milestoneId: string) => {
      onCompleteMilestone(milestoneId, () => {
        handleCloseDrawer();
      });
    },
    [onCompleteMilestone, handleCloseDrawer]
  );

  const handleGenerateProject = useCallback(
    (opts: { milestoneId: string; skill?: string }) => {
      onGenerateProject(opts, () => {
        handleCloseDrawer();
      });
    },
    [onGenerateProject, handleCloseDrawer]
  );

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
          hasProject: m.hasProject || Boolean(getProjectForMilestone?.(m.id, m.title)),
          projectId: m.projectId || getProjectForMilestone?.(m.id, m.title)?.id || null,
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
              ? "var(--color-primary, #9F54F7)"
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
  }, [milestones, targetMilestoneId, handleSelectNode, getProjectForMilestone]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelCapture = (e: WheelEvent) => {
      // Allow browser or graph zoom if modifier key (Ctrl or Meta) is held
      if (e.ctrlKey || e.metaKey) return;

      const delta =
        e.deltaMode === 1
          ? e.deltaY * 24
          : e.deltaMode === 2
            ? e.deltaY * window.innerHeight
            : e.deltaY;

      // Stop ReactFlow / D3 from capturing or hijacking the wheel
      e.preventDefault();
      e.stopPropagation();

      const dashboardLenis =
        typeof window !== "undefined"
          ? (window as unknown as { __dashboardLenis?: Lenis }).__dashboardLenis
          : undefined;

      if (dashboardLenis) {
        dashboardLenis.scrollTo(dashboardLenis.targetScroll + delta, {
          programmatic: false,
          lerp: 0.1,
        });
      } else {
        const scrollContainer =
          (container.closest("section[aria-label='Dashboard content']") as HTMLElement | null) ||
          (document.querySelector("section[aria-label='Dashboard content']") as HTMLElement | null);

        if (scrollContainer) {
          scrollContainer.scrollBy({
            top: delta,
            behavior: "smooth",
          });
        } else {
          window.scrollBy({
            top: delta,
            behavior: "smooth",
          });
        }
      }
    };

    container.addEventListener("wheel", handleWheelCapture, { capture: true, passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheelCapture, { capture: true });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[760px] md:h-[840px] rounded-2xl overflow-hidden border border-border dashboard-card !p-0 nowheel"
    >
      {/* Top Left Title Card Overlay (Toggleable Collapse / Expand) */}
      {isOverviewOpen ? (
        <div className="absolute top-6 left-6 z-10 max-w-sm md:max-w-md p-5 rounded-2xl bg-card/95 border border-border shadow-2xl backdrop-blur-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Target className="w-4 h-4" /> {targetRole} Roadmap
            </div>
            <div className="flex items-center gap-1.5">
              {onToggleView && (
                <button
                  onClick={onToggleView}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-all border border-border cursor-pointer"
                  title="Switch to List View"
                >
                  <List className="w-3.5 h-3.5" /> List View
                </button>
              )}
              <button
                onClick={() => setIsOverviewOpen(false)}
                className="p-1.5 rounded-lg bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/80 cursor-pointer"
                title="Hide Overview (Expand canvas space)"
                aria-label="Hide Overview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
      ) : (
        /* Top Left Collapsed Badge / Toggle Button */
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => setIsOverviewOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card/95 border border-border hover:border-primary/50 shadow-xl backdrop-blur-xl text-foreground text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer group"
            title="Click to view Roadmap Overview"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="flex items-center gap-1.5 text-primary font-bold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" /> {targetRole} Roadmap
            </span>
            <span className="text-muted-foreground font-normal">|</span>
            <span className="text-emerald-500 font-bold">{overallProgress}% Mastered</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-transform ml-1" />
          </button>

          {onToggleView && (
            <button
              onClick={onToggleView}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-2xl bg-card/95 hover:bg-muted border border-border shadow-xl backdrop-blur-xl text-foreground transition-all cursor-pointer"
              title="Switch to List View"
            >
              <List className="w-3.5 h-3.5" /> List View
            </button>
          )}
        </div>
      )}

      {/* React Flow Graph Engine */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => handleSelectNode(node.id)}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={1.5}
        preventScrolling={false}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={true}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        zoomActivationKeyCode={null}
        panActivationKeyCode={null}
        className="bg-transparent nowheel"
      >

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
            if (status === "completed") return "var(--color-primary, #9F54F7)";
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
        onClose={handleCloseDrawer}
        onComplete={handleComplete}
        isCompleting={isCompleting}
        onGenerateProject={handleGenerateProject}
        isGeneratingProject={isGeneratingProject}
        hasProject={
          selectedMilestone
            ? Boolean(selectedMilestone.hasProject || getProjectForMilestone?.(selectedMilestone.id, selectedMilestone.title))
            : false
        }
        projectId={
          selectedMilestone
            ? selectedMilestone.projectId || getProjectForMilestone?.(selectedMilestone.id, selectedMilestone.title)?.id || null
            : null
        }
        onSelectActive={() => {
          const activeM = milestones.find((m) => m.status === "current") || milestones[0];
          if (activeM) handleSelectNode(activeM.id);
        }}
        activeMilestoneTitle={(milestones.find((m) => m.status === "current") || milestones[0])?.title}
        targetSkillGap={targetSkillGap}
      />
    </div>
  );
}
