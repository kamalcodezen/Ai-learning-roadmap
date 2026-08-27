import { redirect } from "next/navigation";
import { getCareerTwin } from "@/src/lib/api/career-twin";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import Link from "next/link";
import { Bot, Target, Trophy, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

export default async function CareerTwinPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) { redirect("/"); }
  const userId = session.user.id;
  const data = await getCareerTwin(userId);

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Career Twin</h1>
        <p className="text-muted-foreground">Your AI-generated professional profile and readiness analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Target Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card-soft p-4 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground mb-1">Target Role</p>
                <p className="font-semibold text-lg">{data.targetRole}</p>
              </div>
              <div className="bg-card-soft p-4 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground mb-1">Level</p>
                <p className="font-semibold text-lg">{data.experienceLevel}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Granular Readiness</h3>
              <div className="space-y-3">
                {Object.entries(data.scores).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{key}</span>
                      <span className="font-medium">{value}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${value > 70 ? 'bg-green-500' : value > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-1 flex flex-col gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Trophy className="w-5 h-5" /> Overall Readiness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-bold text-primary">{data.readinessScore}%</span>
              </div>
              <p className="text-sm text-muted-foreground">Based on your assessments, projects, and evidence provided.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skill Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Strong Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.strongSkills.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Needs Work
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.weakSkills.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20">{s}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Identified Career Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.careerGaps.map((gap, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                  {gap}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-10 -mt-10" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Bot className="w-5 h-5" /> Recommended Action
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 flex flex-col h-[calc(100%-4rem)]">
            <h3 className="font-semibold text-lg mb-2">{data.recommendedAction.title}</h3>
            <p className="text-sm text-muted-foreground mb-6 flex-1">
              {data.recommendedAction.description}
            </p>
            <Link 
              href={data.recommendedAction.href}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:brightness-110 transition-all"
            >
              {data.recommendedAction.actionLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
