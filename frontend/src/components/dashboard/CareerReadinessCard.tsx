import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DashboardData } from "./types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  data: DashboardData["readiness"];
  role: string;
}

export default function CareerReadinessCard({ data, role }: Props) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.score / 100) * circumference;

  return (
    <Card className="col-span-1 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
      <CardHeader>
        <CardTitle>Career Readiness</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center relative z-10 h-full">
        <div className="relative flex items-center justify-center mb-6">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              className="text-muted"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="64"
              cy="64"
            />
            <circle
              className="text-primary transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="64"
              cy="64"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-foreground">{data.score}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">/ 100</span>
          </div>
        </div>

        <h4 className="text-lg font-semibold text-foreground mb-6 text-center">{role}</h4>

        <div className="w-full space-y-3 mb-8">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Knowledge</span>
            <span className="font-medium">{data.knowledge ? `${data.knowledge}%` : "—"}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Practical</span>
            <span className="font-medium text-muted-foreground">{data.practical ? `${data.practical}%` : "—"}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Projects</span>
            <span className="font-medium text-muted-foreground">{data.projects ? `${data.projects}%` : "—"}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Problem Solving</span>
            <span className="font-medium text-muted-foreground">{data.problemSolving ? `${data.problemSolving}%` : "—"}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Communication</span>
            <span className="font-medium text-muted-foreground">{data.communication ? `${data.communication}%` : "—"}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Interview</span>
            <span className="font-medium text-muted-foreground">{data.interview ? `${data.interview}%` : "—"}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Evidence</span>
            <span className="font-medium text-muted-foreground">{data.evidence ? `${data.evidence}%` : "—"}</span>
          </div>
        </div>

        <Link 
          href="/career-twin" 
          className="w-full mt-auto flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          View Career Twin <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
