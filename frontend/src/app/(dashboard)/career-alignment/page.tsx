import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { getCareerAlignment } from "@/src/lib/api/career-alignment";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { CheckCircle2, Target, AlertTriangle, ArrowRight, Lightbulb, Compass } from "lucide-react";
import Link from "next/link";

export default async function CareerAlignmentPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id || "mock-user-id";
  const data = await getCareerAlignment(userId);

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Career Alignment</h1>
        <p className="text-muted-foreground">See how your current skills match up against your target role requirements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 border-primary/20 bg-primary/5">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Target Role</p>
              <h2 className="text-3xl font-bold text-foreground">{data.targetRole}</h2>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-primary/20"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeDasharray={`${data.matchPercentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{data.matchPercentage}%</span>
                  <span className="text-xs font-semibold text-muted-foreground">Match</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-primary/30 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-10 -mt-10" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Compass className="w-5 h-5" /> Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 z-10">
            <p className="text-sm text-muted-foreground mb-6">
              You are on the right track! Focus on acquiring your missing high-priority skills.
            </p>
            <Link 
              href={data.href}
              className="mt-auto w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:brightness-110 flex items-center justify-center gap-2 transition-all"
            >
              {data.nextAction} <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Strong Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.strongSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-sm font-medium border border-green-500/20">
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Missing Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.missingSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 text-sm font-medium border border-amber-500/20">
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.requirements.map((req, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-card-soft flex flex-col justify-between h-full gap-3">
                <div className="flex justify-between items-start">
                  <span className="font-semibold">{req.skill}</span>
                  {req.status === 'acquired' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : req.status === 'learning' ? (
                    <Target className="w-5 h-5 text-primary" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    req.importance === 'High' ? 'bg-destructive/10 text-destructive' : 
                    req.importance === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {req.importance} Priority
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Lightbulb className="w-5 h-5" /> Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
