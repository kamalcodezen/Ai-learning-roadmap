"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
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
import ProofGraphNodeComponent from "./ProofGraphNode";
import { ProofNodeDrawer } from "./ProofNodeDrawer";
import { ProofGraphNode, ProofGraphEdge } from "@/src/lib/api/learner/proof-graph";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Share2,
  Search,
  List,
  FolderGit2,
  Layers,
  Activity,
  ArrowRight,
} from "lucide-react";

const nodeTypes = {
  proofNode: ProofGraphNodeComponent,
};

interface ProofGraphCanvasProps {
  primarySkill: string;
  overallProofScore: number;
  nodes: ProofGraphNode[];
  edges: ProofGraphEdge[];
  onToggleView?: () => void;
  onShare?: () => void;
}

export function ProofGraphCanvas({
  primarySkill,
  overallProofScore,
  nodes: rawNodes,
  edges: rawEdges,
  onToggleView,
  onShare,
}: ProofGraphCanvasProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const selectedNode = useMemo(
    () => rawNodes.find((n) => n.id === selectedNodeId) || null,
    [rawNodes, selectedNodeId]
  );

  // Hierarchical Cluster Layout Algorithm (Zero Criss-Crossing Lines)
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const matchesFilter = (n: ProofGraphNode) => {
      if (filterType !== "all" && n.type.toLowerCase() !== filterType.toLowerCase()) {
        return false;
      }
      if (filterStatus !== "all" && n.status.toLowerCase() !== filterStatus.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim() && !n.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    };

    const skillNodes = rawNodes.filter((n) => n.type === "skill");
    const placedNodeIds = new Set<string>();
    const positionMap = new Map<string, { x: number; y: number }>();

    let currentY = 120;
    const SKILL_X = 60;
    const EVIDENCE_X = 420;
    const PROJECT_X = 780;
    const ROW_HEIGHT = 150;
    const CLUSTER_GAP = 50;

    // 1. Process each skill as a clean, parallel verification pipeline
    skillNodes.forEach((skill) => {
      placedNodeIds.add(skill.id);

      // Find direct outgoing targets from this skill
      const childEdges = rawEdges.filter((e) => e.source === skill.id);
      const directChildren = childEdges
        .map((e) => rawNodes.find((n) => n.id === e.target))
        .filter((n): n is ProofGraphNode => Boolean(n && !placedNodeIds.has(n.id)));

      if (directChildren.length === 0) {
        positionMap.set(skill.id, { x: SKILL_X, y: currentY });
        currentY += ROW_HEIGHT + CLUSTER_GAP;
        return;
      }

      let clusterRowCount = 0;
      const childPlacements: Array<{
        node: ProofGraphNode;
        y: number;
        grandChildren: ProofGraphNode[];
      }> = [];

      directChildren.forEach((child) => {
        placedNodeIds.add(child.id);

        // Find grandchildren (e.g. Project connected to Evidence)
        const grandChildEdges = rawEdges.filter((e) => e.source === child.id);
        const grandChildren = grandChildEdges
          .map((e) => rawNodes.find((n) => n.id === e.target))
          .filter((n): n is ProofGraphNode => Boolean(n && !placedNodeIds.has(n.id)));

        grandChildren.forEach((gc) => placedNodeIds.add(gc.id));

        const rowsForThisChild = Math.max(1, grandChildren.length);
        const childY = currentY + clusterRowCount * ROW_HEIGHT;

        childPlacements.push({
          node: child,
          y: childY,
          grandChildren,
        });

        clusterRowCount += rowsForThisChild;
      });

      // Vertically center the skill node relative to its children
      const clusterTotalHeight = clusterRowCount * ROW_HEIGHT;
      const skillCenterY = currentY + (clusterTotalHeight - ROW_HEIGHT) / 2;
      positionMap.set(skill.id, { x: SKILL_X, y: skillCenterY });

      // Place children and grandchildren
      childPlacements.forEach(({ node: child, y: childY, grandChildren }) => {
        positionMap.set(child.id, { x: EVIDENCE_X, y: childY });
        grandChildren.forEach((gc, gcIdx) => {
          positionMap.set(gc.id, { x: PROJECT_X, y: childY + gcIdx * ROW_HEIGHT });
        });
      });

      currentY += clusterTotalHeight + CLUSTER_GAP;
    });

    // 2. Process any remaining unattached nodes (Interviews, Standalone Capstones)
    const remainingNodes = rawNodes.filter((n) => !placedNodeIds.has(n.id));
    if (remainingNodes.length > 0) {
      currentY += 20;
      remainingNodes.forEach((node, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const xPos = col === 0 ? SKILL_X : col === 1 ? EVIDENCE_X : PROJECT_X;
        positionMap.set(node.id, {
          x: xPos,
          y: currentY + row * (ROW_HEIGHT + 20),
        });
      });
    }

    // 3. Assemble React Flow Nodes
    rawNodes.forEach((node, idx) => {
      const isVisible = matchesFilter(node);
      const pos = positionMap.get(node.id) || {
        x: (idx % 3) * 360 + 60,
        y: Math.floor(idx / 3) * 160 + 120,
      };

      nodes.push({
        id: node.id,
        type: "proofNode",
        position: pos,
        hidden: !isVisible,
        data: {
          id: node.id,
          type: node.type,
          title: node.title,
          status: node.status,
          description: node.description,
          score: node.score,
          metadata: node.metadata,
          onSelectNode: handleSelectNode,
        },
      });
    });

    // 4. Assemble React Flow Edges with smooth clean routing
    rawEdges.forEach((edge, idx) => {
      const sourceNode = rawNodes.find((n) => n.id === edge.source);
      const targetNode = rawNodes.find((n) => n.id === edge.target);

      const isSourceVisible = sourceNode ? matchesFilter(sourceNode) : true;
      const isTargetVisible = targetNode ? matchesFilter(targetNode) : true;

      const isBothVerified = sourceNode?.status === "verified" && targetNode?.status === "verified";
      const isPending = sourceNode?.status === "pending" || targetNode?.status === "pending";

      const edgeColor = isBothVerified
        ? "#10b981"
        : isPending
        ? "#fbbf24"
        : "var(--color-border, #52525b)";

      edges.push({
        id: `edge-${edge.source}-${edge.target}-${idx}`,
        source: edge.source,
        target: edge.target,
        type: "bezier",
        animated: isPending,
        hidden: !isSourceVisible || !isTargetVisible,
        label: edge.label,
        labelStyle: {
          fill: "var(--color-foreground, #e4e4e7)",
          fontSize: 9,
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: "var(--color-surface, #18181b)",
          fillOpacity: 0.9,
          rx: 4,
          ry: 4,
          stroke: "var(--color-border, #27272a)",
          strokeWidth: 1,
        },
        labelBgPadding: [4, 2],
        style: {
          stroke: edgeColor,
          strokeWidth: isBothVerified ? 2.5 : 1.75,
          strokeDasharray: isPending ? "4,4" : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
          width: 10,
          height: 10,
        },
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [rawNodes, rawEdges, filterType, filterStatus, searchQuery, handleSelectNode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Node Count Statistics
  const verifiedCount = rawNodes.filter((n) => n.status === "verified").length;
  const pendingCount = rawNodes.filter((n) => n.status === "pending").length;
  const skillCount = rawNodes.filter((n) => n.type === "skill").length;
  const projectCount = rawNodes.filter((n) => n.type === "project").length;
  const evidenceCount = rawNodes.filter((n) => n.type === "evidence").length;
  const diagCount = rawNodes.filter((n) => n.type === "diagnostic" || n.type === "assessment").length;

  return (
    <div className="relative w-full h-[780px] md:h-[860px] rounded-2xl overflow-hidden border border-border dashboard-card !p-0 flex flex-col">
      {/* ── TOP HUD HEADER CARD ── */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pointer-events-none">
        {/* Left Summary Card */}
        <div className="pointer-events-auto p-4 rounded-xl bg-card/95 border border-border backdrop-blur-xl  flex flex-col sm:flex-row sm:items-center gap-4 max-w-xl mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="w-4 h-4" /> Cryptographic Verification Pipeline
            </div>
            <h3 className="text-base md:text-lg font-black text-foreground tracking-tight">
              {primarySkill}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {verifiedCount} Verified
              </span>
              <span>•</span>
              <span className="text-amber-400 font-medium">
                {pendingCount} In Review
              </span>
            </div>
          </div>

          <div className="sm:border-l sm:border-border sm:pl-4 flex flex-col justify-center min-w-[130px]">
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="text-muted-foreground text-[11px]">Proof Score</span>
              <span className="text-primary font-black text-sm">
                {overallProofScore}%
              </span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-primary/80 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${overallProofScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Search & Filter Actions */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-card/95 border border-border backdrop-blur-xl p-2 rounded-xl">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search proof..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary w-32 sm:w-36 transition-all"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified Only</option>
            <option value="pending">In Review</option>
          </select>

          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          )}

          {onToggleView && (
            <button
              onClick={onToggleView}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer"
            >
              <List className="w-3.5 h-3.5" /> Tree View
            </button>
          )}
        </div>
      </div>

      {/* ── VISUAL COLUMN LANE HEADERS ── */}
      <div className="absolute top-[92px] left-0 right-0 z-[5] pointer-events-none hidden md:flex items-center px-12 text-xs font-bold uppercase tracking-wider text-muted-foreground mt-13">
        <div className="w-[360px] flex items-center gap-2 text-primary/90 pl-3">
          <span className="w-2 h-2 rounded-full bg-primary" />
          1. Core Competency
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="w-[360px] flex items-center gap-2 text-emerald-400/90 pl-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          2. Code Evidence & Tests
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="w-[360px] flex items-center gap-2 text-sky-400/90 pl-3">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          3. Verified Projects & Demos
        </div>
      </div>

      {/* ── BOTTOM CATEGORY FILTER PILLS ── */}
      <div className="absolute bottom-4 left-4 z-10 hidden md:flex items-center gap-1.5 bg-card/95 border border-border backdrop-blur-xl p-1.5 rounded-xl ">
        <button
          onClick={() => setFilterType("all")}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer  ${
            filterType === "all"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Layers className="w-3 h-3" /> All ({rawNodes.length})
        </button>

        <button
          onClick={() => setFilterType("skill")}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer mt-30 ${
            filterType === "skill"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <ShieldCheck className="w-3 h-3" /> Skills ({skillCount})
        </button>

        <button
          onClick={() => setFilterType("evidence")}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            filterType === "evidence"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Sparkles className="w-3 h-3" /> Evidence ({evidenceCount})
        </button>

        <button
          onClick={() => setFilterType("project")}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            filterType === "project"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <FolderGit2 className="w-3 h-3" /> Projects ({projectCount})
        </button>

        <button
          onClick={() => setFilterType("diagnostic")}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            filterType === "diagnostic"
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Activity className="w-3 h-3" /> Diagnostics ({diagCount})
        </button>
      </div>

      {/* ── REACT FLOW GRAPH ENGINE ── */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
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
        className="bg-transparent mt-28"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="var(--color-border, #27272a)"
        />

        <Controls
          className="!bg-card !border !border-border !rounded-xl !shadow-xl [&>button]:!bg-card [&>button]:!border-b [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
          showInteractive={false}
        />

        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            const status = (node.data as { status?: string })?.status;
            if (status === "verified") return "#10b981";
            if (status === "pending") return "#fbbf24";
            return "var(--color-border, #3f3f46)";
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
          className="!bg-card !border !border-border !rounded-xl !shadow-2xl overflow-hidden !bottom-4 !right-4 hidden md:flex"
        />
      </ReactFlow>

      {/* Slide-out Proof Node Details Drawer */}
      <ProofNodeDrawer
        node={selectedNode}
        allNodes={rawNodes}
        allEdges={rawEdges}
        onClose={() => setSelectedNodeId(null)}
        onSelectConnectedNode={(id) => setSelectedNodeId(id)}
      />
    </div>
  );
}
