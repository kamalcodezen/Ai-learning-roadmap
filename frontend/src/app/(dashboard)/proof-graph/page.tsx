import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { getProofGraph } from "@/src/lib/api/proof-graph";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { CheckCircle2, Circle, AlertCircle, XCircle, ArrowDown, ShieldCheck, FileCode, CheckSquare, BrainCircuit, Activity } from "lucide-react";

export default async function ProofGraphPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id || "mock-user-id";
  const data = await getProofGraph(userId);

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
      case 'assessment': return <CheckSquare className="w-6 h-6" />;
      case 'project': return <FileCode className="w-6 h-6" />;
      case 'evidence': return <ShieldCheck className="w-6 h-6" />;
      default: return <Circle className="w-6 h-6" />;
    }
  };

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

      <div className="relative max-w-3xl mx-auto w-full py-8">
        {/* Connecting line behind nodes */}
        <div className="absolute left-1/2 top-8 bottom-8 w-1 -ml-[0.5px] bg-border z-0" />
        
        <div className="flex flex-col gap-8 relative z-10">
          {data.nodes.map((node, index) => (
            <div key={node.id} className="flex flex-col items-center">
              <div className="w-full flex items-center justify-center relative">
                
                {/* Node Box */}
                <Card className={`w-full max-w-sm transition-all hover:border-primary/50 relative z-10 bg-card/95 backdrop-blur shadow-md ${
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
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Arrow linking nodes (skip after last) */}
              {index < data.nodes.length - 1 && (
                <div className="h-8 flex items-center justify-center text-muted-foreground z-10 my-1">
                  <ArrowDown className="w-5 h-5 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
