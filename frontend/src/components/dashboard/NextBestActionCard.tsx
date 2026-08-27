import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DashboardData } from "@/src/app/(dashboard)/dashboard/types";
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
    <Card mouseGlow className="group relative overflow-hidden rounded-md p-6 h-full transition-all duration-300 border-2 border-background hover:border-brand shadow-none bg-[linear-gradient(to_bottom,#faf5ff_0%,#f3edff_45%,#ede5ff_100%)] dark:bg-[linear-gradient(to_bottom,#1a0e2e_0%,rgba(159,84,247,0.15)_100%)]">
      {/* Corner shape */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full bg-gradient-to-br from-primary/20 to-blue-500/10 pointer-events-none" />

      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Zap className="w-5 h-5 fill-primary" /> Your Next Best Action
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col relative z-10 h-full">
        <h3 className="text-xl font-bold text-foreground mb-2">{data.title}</h3>
        <p className="text-muted-foreground mb-6">{data.description}</p>
        
        <div className="mt-auto space-y-4">
          <div className="bg-card-soft rounded-lg p-4 border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Reason</span>
            <p className="text-sm text-foreground">{data.reason}</p>
          </div>

          <Link 
            href={data.href} 
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {data.actionLabel} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
