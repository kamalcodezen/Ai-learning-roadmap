import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DashboardData } from "./types";
import Link from "next/link";
import { ArrowRight, Check, AlertTriangle } from "lucide-react";

interface Props {
  data: DashboardData["careerAlignment"];
}

export default function CareerAlignmentCard({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Career Alignment</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="mb-6">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-muted-foreground">Target Role</span>
            <span className="font-semibold text-foreground text-right">{data.target}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Current Fit</span>
            <span className="font-bold text-primary">{data.fitScore}%</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Strong</h5>
            <div className="space-y-2">
              {data.strong.map((skill, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Needs Attention</h5>
            <div className="space-y-2">
              {data.needsAttention.map((skill, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <Link 
          href="/career-alignment" 
          className="w-full mt-auto flex items-center justify-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          Check Job Fit <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
