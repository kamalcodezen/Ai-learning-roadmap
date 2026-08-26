import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DashboardData } from "./types";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, PlayCircle } from "lucide-react";

interface Props {
  data: DashboardData["roadmap"];
}

export default function RoadmapPreview({ data }: Props) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your AI Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No roadmap generated yet. Complete your diagnostic to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your AI Roadmap</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="space-y-4 mb-8">
          {data.milestones.slice(0, 6).map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              {m.status === "COMPLETED" && <CheckCircle2 className="w-5 h-5 text-primary" />}
              {m.status === "IN_PROGRESS" && <PlayCircle className="w-5 h-5 text-secondary dark:text-primary animate-pulse" />}
              {m.status === "PENDING" && <Circle className="w-5 h-5 text-muted-foreground" />}
              
              <span className={`text-sm font-medium ${
                m.status === "COMPLETED" ? "text-muted-foreground line-through" :
                m.status === "IN_PROGRESS" ? "text-foreground font-bold" :
                "text-muted-foreground"
              }`}>
                {m.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-auto mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Current: <span className="text-foreground font-medium">{data.currentMilestone}</span></span>
            <span className="font-bold text-primary">{data.progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out" 
              style={{ width: `${data.progress}%` }} 
            />
          </div>
        </div>

        <Link 
          href="/learning-path" 
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          View Full Roadmap <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
