import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DashboardData } from "./types";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, AlertCircle } from "lucide-react";

interface Props {
  data: DashboardData["proof"];
}

export default function SkillProofPreview({ data }: Props) {
  return (
    <Card mouseGlow>
      <CardHeader>
        <CardTitle>Skill Proof</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <h4 className="text-sm font-semibold text-foreground mb-4">{data.skillName || "Top Skill"}</h4>
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            {data.knowledge === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
            <span className="text-sm">Knowledge</span>
          </div>
          <div className="flex items-center gap-3">
            {data.practice === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
            <span className="text-sm">Practice</span>
          </div>
          <div className="flex items-center gap-3">
            {data.evidence === 'COMPLETED' && <CheckCircle2 className="w-5 h-5 text-primary" />}
            {data.evidence === 'WARNING' && <AlertCircle className="w-5 h-5 text-amber-500" />}
            {data.evidence === 'PENDING' && <Circle className="w-5 h-5 text-muted-foreground" />}
            <span className="text-sm">Project Evidence</span>
          </div>
        </div>
        <Link 
          href="/proof-graph" 
          className="w-full mt-auto flex items-center justify-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          Explore Proof Graph <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
