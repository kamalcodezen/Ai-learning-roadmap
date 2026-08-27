import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DashboardData } from "@/src/app/(dashboard)/dashboard/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  data: DashboardData["weeklyProgress"];
}

export default function WeeklyProgressCard({ data }: Props) {
  const hasData = data && Object.values(data).some(v => v !== null && v > 0);

  return (
    <Card mouseGlow>
      <CardHeader>
        <CardTitle>This Week</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        {!hasData ? (
          <div className="flex-1 flex items-center justify-center py-4">
            <p className="text-muted-foreground text-sm">No activity data yet.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Learning</span>
              <span className="font-medium">{data.learning || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Assessments</span>
              <span className="font-medium">{data.assessments || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Projects</span>
              <span className="font-medium">{data.projects || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Practice</span>
              <span className="font-medium">{data.practice || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Career Readiness</span>
              <span className="font-medium">{data.careerReadiness ? `+${data.careerReadiness}` : '—'}</span>
            </div>
          </div>
        )}
        <Link 
          href="/progress" 
          className="w-full mt-auto flex items-center justify-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          View Progress <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
