import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DashboardData } from "./types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  data: DashboardData["assessments"];
}

export default function AssessmentProgressCard({ data }: Props) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No assessment history yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card mouseGlow>
      <CardHeader>
        <CardTitle>Assessments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-foreground">Completed</span>
            <span className="font-bold text-primary">{data.completedCount}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-foreground">Pending</span>
            <span className="font-bold text-muted-foreground">{data.pendingCount}</span>
          </div>
        </div>
        <Link 
          href="/assessments" 
          className="w-full mt-auto flex items-center justify-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          View Assessments <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
