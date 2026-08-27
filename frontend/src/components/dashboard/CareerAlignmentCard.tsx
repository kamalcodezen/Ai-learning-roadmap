import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { DashboardData } from "./types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  data: DashboardData["careerAlignment"];
}

export default function CareerAlignmentCard({ data }: Props) {
  return (
    <Card mouseGlow>
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
            <span className="text-muted-foreground">Alignment Status</span>
            <span className={`font-bold ${data.isAvailable ? 'text-primary' : 'text-muted-foreground'}`}>
              {data.isAvailable ? 'Data Available' : 'Needs more data'}
            </span>
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
