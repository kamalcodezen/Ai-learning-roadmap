"use client";

import { redirect } from "next/navigation";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { getProofGraph, ProofGraphNode } from "@/src/lib/api/learner/proof-graph";
import { useQuery } from "@tanstack/react-query";
import GenericPageSkeleton from "../../shared/GenericPageSkeleton";
import { Card, CardContent } from "@/src/components/ui/Card";
import { CheckCircle2, Circle, AlertCircle, XCircle, ShieldCheck, FileCode, CheckSquare, BrainCircuit, Activity, Users } from "lucide-react";

export default function ProofGraphPage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["proofGraph", session?.user?.id],
    queryFn: () => getProofGraph(),
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
        <button onClick={() => refetch()} className="bg-primary text-primary-foreground px-4 py-2 rounded-md">Retry</button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'missing': return <XCircle className="w-5 h-5 text-destructive" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'skill': return <ShieldCheck className="w-6 h-6" />;
      case 'knowledge': return <BrainCircuit className="w-6 h-6" />;
      case 'practice': return <Activity className="w-6 h-6" />;
      case 'diagnostic':
      case 'assessment': return <CheckSquare className="w-6 h-6" />;
      case 'project': return <FileCode className="w-6 h-6" />;
      case 'evidence': return <ShieldCheck className="w-6 h-6" />;
      case 'interview': return <Users className="w-6 h-6" />;
      default: return <Circle className="w-6 h-6" />;
    }
  };

  const renderNode = (node: ProofGraphNode, indentLevel: number = 0, isLast: boolean = true) => {
    return (
      <div key={node.id} className={`relative flex items-stretch mt-4 ${indentLevel > 0 ? 'ml-8' : ''}`}>
        {indentLevel > 0 && (
          <div className="absolute -left-6 top-6 w-6 h-px bg-border" />
        )}
        {indentLevel > 0 && !isLast && (
          <div className="absolute -left-6 top-6 bottom-[-24px] w-px bg-border" />
        )}
        {indentLevel > 0 && isLast && (
          <div className="absolute -left-6 top-0 h-6 w-px bg-border" />
        )}
        
        <Card className={`w-full max-w-sm transition-all hover:border-primary/50 relative z-10 bg-card/95 shadow-sm ${
          node.status === 'verified' ? 'border-green-500/30' :
          node.status === 'missing' ? 'border-destructive/30' :
          'border-amber-500/30'
        }`}>
          <CardContent className="p-4 flex gap-4 items-start">
            <div className={`p-2 rounded-lg shrink-0 mt-1 ${
              node.status === 'verified' ? 'bg-green-500/10 text-green-500' :
              node.status === 'missing' ? 'bg-destructive/10 text-destructive' :
              'bg-amber-500/10 text-amber-500'
            }`}>
              {getTypeIcon(node.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{node.type}</span>
                {getStatusIcon(node.status)}
              </div>
              <h3 className="font-bold text-foreground truncate">{node.title}</h3>
              {node.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{node.description}</p>
              )}
              {node.score !== undefined && (
                <div className="mt-2 text-sm font-medium">
                  Score: <span className={node.score > 70 ? 'text-green-500' : 'text-amber-500'}>{node.score}%</span>
                </div>
              )}
              {node.metadata && (
                <div className="mt-2 flex gap-2">
                  {node.metadata.githubUrl && <a href={node.metadata.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">GitHub</a>}
                  {node.metadata.liveUrl && <a href={node.metadata.liveUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Live Demo</a>}
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

  const renderTree = (node: ProofGraphNode, indentLevel: number = 0, isLast: boolean = true) => {
    const children = getChildren(node.id);
    return (
      <div key={`tree-${node.id}`} className="relative">
        {renderNode(node, indentLevel, isLast)}
        {children.length > 0 && (
          <div className="relative">
            {indentLevel === 0 && <div className="absolute left-[34px] top-0 bottom-0 w-px bg-border" />}
            {children.map((child, idx) => 
              renderTree(child, indentLevel + 1, idx === children.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // Find root nodes (nodes that are never targets)
  const rootNodes = data.nodes.filter(
    (node) => !data.edges.some((edge) => edge.target === node.id)
  );

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Proof Graph</h1>
        <p className="text-muted-foreground">Trace the verifiable evidence backing your skills.</p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Analyzing Skill Chain</p>
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              {data.primarySkill}
            </h2>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground mb-1">Overall Proof Score</p>
            <div className="text-3xl font-bold text-foreground">{data.overallProofScore}%</div>
          </div>
        </CardContent>
      </Card>

      <div className="mx-auto w-full max-w-4xl py-4 flex flex-col gap-8">
        {rootNodes.length === 0 || data.nodes.find(n => n.id === "empty-state-node") ? (
           <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl">
             <ShieldCheck className="w-12 h-12 text-muted-foreground mb-4" />
             <h3 className="text-xl font-bold mb-2">No proof available yet.</h3>
             <p className="text-muted-foreground max-w-md">
               Complete assessments, build projects, and add verified evidence to build your proof graph.
             </p>
           </div>
        ) : (
          rootNodes.map((rootNode, i) => renderTree(rootNode, 0, i === rootNodes.length - 1))
        )}
      </div>
    </div>
  );
}
