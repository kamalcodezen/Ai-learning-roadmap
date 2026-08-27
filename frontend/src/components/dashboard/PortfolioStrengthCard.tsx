import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DashboardData } from "./types";
import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";

interface Props {
  data: DashboardData["portfolio"];
}

export default function PortfolioStrengthCard({ data }: Props) {
  return (
    <Card mouseGlow>
      <CardHeader>
        <CardTitle>Portfolio Strength</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        {(!data || data.projectCount === 0) ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <FolderKanban className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm mb-2">No project evidence yet.</p>
            <p className="text-xs text-muted-foreground/70">Complete projects to start building your portfolio strength.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <span className="text-4xl font-bold text-primary mb-2">{data.projectCount}</span>
            <span className="text-sm text-muted-foreground">Project{data.projectCount !== 1 ? 's' : ''} Documented</span>
          </div>
        )}
        <Link 
          href="/portfolio" 
          className="w-full mt-auto flex items-center justify-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          View Projects <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
