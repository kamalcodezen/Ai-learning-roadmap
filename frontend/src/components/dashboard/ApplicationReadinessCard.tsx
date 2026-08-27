import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DashboardData } from "./types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  data: DashboardData["applicationReadiness"];
}

export default function ApplicationReadinessCard({ data }: Props) {
  const isAvailable = Object.values(data).some(v => v !== null);

  return (
    <Card mouseGlow>
      <CardHeader>
        <CardTitle>Application Readiness</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        {!isAvailable ? (
          <div className="flex-1 flex items-center justify-center py-4 mb-4">
            <p className="text-muted-foreground text-sm">Not available yet</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Technical</span>
              <span className="font-medium text-foreground">{data.technical ? `${data.technical}%` : '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Projects</span>
              <span className="font-medium text-foreground">{data.projects ? `${data.projects}%` : '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Portfolio</span>
              <span className="font-medium text-foreground">{data.portfolio ? `${data.portfolio}%` : '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interview</span>
              <span className="font-medium text-foreground">{data.interview ? `${data.interview}%` : '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Resume</span>
              <span className="font-medium text-foreground">{data.resume ? `${data.resume}%` : '—'}</span>
            </div>
          </div>
        )}
        <Link 
          href="/application-readiness" 
          className="w-full mt-auto flex items-center justify-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          See What&apos;s Missing <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
