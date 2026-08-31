import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { DashboardData } from "@/src/app/(dashboard)/dashboard/types";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";

interface Props {
  data: DashboardData["skills"];
}

export default function SkillHealthCard({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill Health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No skill data yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card mouseGlow>
      <CardHeader>
        <CardTitle>Skill Health</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="space-y-4 mb-6">
          {data.map((skill, index) => (
            <div key={index}>
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-medium text-foreground">{skill.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">{skill.score}%</span>
                  {skill.trend === 'UP' && <TrendingUp className="w-4 h-4 text-primary" />}
                  {skill.trend === 'DOWN' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  {skill.trend === 'FLAT' && <Minus className="w-4 h-4 text-muted-foreground" />}
                  {skill.trend === 'NEW' && <Sparkles className="w-4 h-4 text-amber-500" />}
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-foreground transition-all duration-1000 ease-out" 
                  style={{ width: `${skill.score}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
        <Link 
          href="/dashboard/learner/proof-graph" 
          className="w-full mt-auto flex items-center justify-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          View Skill Health <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
