import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DashboardData } from "./types";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

interface Props {
  data: DashboardData["assessments"];
}

export default function AssessmentProgressCard({ data }: Props) {
  if (!data || data.length === 0) {
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
    <Card>
      <CardHeader>
        <CardTitle>Assessments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="space-y-4 mb-6">
          {data.map((assessment, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{assessment.name}</span>
                {assessment.status === 'COMPLETED' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Completed <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              
              <span className={`font-medium ${assessment.status === 'NOT_STARTED' ? 'text-muted-foreground' : 'text-foreground'}`}>
                {assessment.score !== null ? `${assessment.score}%` : 'Not Started'}
              </span>
            </div>
          ))}
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
