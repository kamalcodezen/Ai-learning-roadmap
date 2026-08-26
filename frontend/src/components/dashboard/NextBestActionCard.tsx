import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DashboardData } from "./types";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

interface Props {
  data: DashboardData["nextAction"];
}

export default function NextBestActionCard({ data }: Props) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Next Best Action</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center py-8">
          <p className="text-muted-foreground">You&apos;re all caught up! Explore the learning path for more.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Zap className="w-24 h-24 text-primary" />
      </div>
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Zap className="w-5 h-5 fill-primary" /> Your Next Best Action
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col relative z-10 h-full">
        <h3 className="text-xl font-bold text-foreground mb-2">{data.title}</h3>
        <p className="text-muted-foreground mb-6">{data.description}</p>
        
        <div className="bg-card-soft rounded-lg p-4 border border-border mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Reason</span>
          <p className="text-sm text-foreground">{data.reason}</p>
        </div>

        <Link 
          href={data.href} 
          className="btn-primary w-full flex items-center justify-center gap-2 mt-auto"
        >
          {data.actionLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
