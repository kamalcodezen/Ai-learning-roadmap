import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DashboardData } from "./types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  data: DashboardData["applicationReadiness"];
}

export default function ApplicationReadinessCard({ data }: Props) {


  return (
    <Card mouseGlow>
      <CardHeader>
        <CardTitle>Application Readiness</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        {!data.isAvailable ? (
          <div className="flex-1 flex items-center justify-center py-4 mb-4">
            <p className="text-muted-foreground text-sm">Not enough data to assess.</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center py-4 mb-4">
            <p className="text-foreground text-sm font-medium">Ready for calculation.</p>
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
