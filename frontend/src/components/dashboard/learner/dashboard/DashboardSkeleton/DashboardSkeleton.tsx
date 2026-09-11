import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";

export default function DashboardSkeleton() {
  return (
    <div className="flex h-[94vh] w-full flex-col overflow-y-hidden dashboard-card-gap">
      {/* Welcome Banner Skeleton */}
      <div className="w-full h-[18%] shrink-0 bg-muted animate-pulse rounded-md border border-border" />

      {/* High Priority Grid Skeleton */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-3 dashboard-card-gap">
        {/* Overall Progress Skeleton */}
        <div className="col-auto lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="h-[25%] bg-muted animate-pulse rounded-t-md">
              <div />
            </CardHeader>
            <CardContent className="h-[65%] bg-muted/50 animate-pulse m-4 rounded-md">
              <div />
            </CardContent>
          </Card>
        </div>
        {/* Next Best Action Skeleton */}
        <div className="col-auto lg:col-span-1 h-full">
          <Card className="h-full">
            <CardHeader className="h-[25%] bg-muted animate-pulse rounded-t-md">
              <div />
            </CardHeader>
            <CardContent className="h-[65%] bg-muted/50 animate-pulse m-4 rounded-md">
              <div />
            </CardContent>
          </Card>
        </div>
        {/* Short Roadmap Skeleton */}
        <div className="col-auto lg:col-span-1 h-full">
          <Card className="h-full">
            <CardHeader className="h-[25%] bg-muted animate-pulse rounded-t-md">
              <div />
            </CardHeader>
            <CardContent className="h-[65%] bg-muted/50 animate-pulse m-4 rounded-md">
              <div />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Grid for Medium & Lower Priority Skeleton */}
      <div className="grid h-[38%] shrink-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 dashboard-card-gap">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-full">
            <CardHeader className="h-[20%] bg-muted animate-pulse rounded-t-md">
              <div />
            </CardHeader>
            <CardContent className="h-[70%] bg-muted/50 animate-pulse m-4 rounded-md">
              <div />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}