import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { getPortfolio } from "@/src/lib/api/portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { FolderGit2, ExternalLink, GitBranch, CheckCircle2, AlertTriangle, FileCode2, Star } from "lucide-react";
import { AlertButton } from "@/src/components/portfolio/AlertButton";

export default async function PortfolioPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) { redirect("/"); }
  const userId = session.user.id;
  const data = await getPortfolio(userId);

  const renderEmptyState = () => (
    <Card className="border-dashed border-2 border-border/60 bg-transparent shadow-none">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <FolderGit2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">No projects evidence yet.</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Your portfolio strength is directly tied to the projects you build. Add your first project to start building your developer proof graph.
        </p>
        <AlertButton 
          text="Create Your First Project" 
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:brightness-110 flex items-center transition-all" 
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Portfolio Strength</h1>
        <p className="text-muted-foreground">Manage and analyze your project portfolio evidence.</p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground flex items-center justify-center md:justify-start gap-2">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> 
              Overall Strength
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Based on the technical depth, explanation quality, and verifiable evidence of your projects.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className={`text-5xl font-bold ${data.overallStrength > 70 ? 'text-green-500' : data.overallStrength > 30 ? 'text-amber-500' : 'text-destructive'}`}>
              {data.overallStrength}%
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-1">Score</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-4">
        <h2 className="text-xl font-semibold">Your Projects</h2>
        {data.projects.length > 0 && (
          <AlertButton 
            text="Add Project" 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 flex items-center transition-all" 
          />
        )}
      </div>

      {data.projects.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {data.projects.map((project) => (
            <Card key={project.id} className="flex flex-col h-full transition-all hover:border-primary/30">
              <CardHeader className="border-b border-border bg-card-soft/50 p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-background rounded-lg shadow-sm border border-border">
                      <FileCode2 className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-border bg-background hover:bg-card transition-colors text-muted-foreground hover:text-foreground">
                        <GitBranch className="w-5 h-5" />
                      </a>
                    )}
                    {project.liveDemoUrl && (
                      <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-border bg-background hover:bg-card transition-colors text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.techStack.map((tech, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs font-semibold rounded-md bg-muted text-muted-foreground border border-border">
                      {tech}
                    </span>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Technical Depth</span>
                      <span className="font-semibold">{project.metrics.technicalDepth}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${project.metrics.technicalDepth > 70 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${project.metrics.technicalDepth}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Explanation Quality</span>
                      <span className="font-semibold">{project.metrics.explanationQuality}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${project.metrics.explanationQuality > 70 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${project.metrics.explanationQuality}%` }} />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/50">
                  <span className="text-sm font-semibold text-muted-foreground">Evidence Status</span>
                  {project.metrics.evidence === 'verified' ? (
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                      <CheckCircle2 className="w-4 h-4" /> Verified
                    </span>
                  ) : project.metrics.evidence === 'unverified' ? (
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      <AlertTriangle className="w-4 h-4" /> Unverified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-destructive bg-destructive/10 px-3 py-1 rounded-full border border-destructive/20">
                      <AlertTriangle className="w-4 h-4" /> Missing Code
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
