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
        <div className="flex-1 flex flex-col items-center justify-center py-6 mb-6">
          <span className="text-4xl font-bold text-primary mb-2">{data.trackedSkillsCount}</span>
          <span className="text-sm text-muted-foreground">Skill{data.trackedSkillsCount !== 1 ? 's' : ''} Tracked</span>
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
