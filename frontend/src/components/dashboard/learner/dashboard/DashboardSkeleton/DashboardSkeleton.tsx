import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5 pb-4 w-full">
      {/* Welcome Banner Skeleton */}
      <div className="w-full h-[200px] sm:h-[220px] lg:h-[250px] bg-muted animate-pulse rounded-md border border-border" />

      {/* High Priority Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Progress Skeleton */}
        <div className="col-auto lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="h-14 bg-muted animate-pulse rounded-t-md">
              <div />
            </CardHeader>
            <CardContent className="h-32 bg-muted/50 animate-pulse m-4 rounded-md">
              <div />
            </CardContent>
          </Card>
        </div>
        {/* Next Best Action Skeleton */}
        <div className="col-auto lg:col-span-1 h-full">
          <Card className="h-full">
            <CardHeader className="h-14 bg-muted animate-pulse rounded-t-md">
              <div />
            </CardHeader>
            <CardContent className="h-32 bg-muted/50 animate-pulse m-4 rounded-md">
              <div />
            </CardContent>
          </Card>
        </div>
        {/* Short Roadmap Skeleton */}
        <div className="col-auto lg:col-span-1 h-full">
          <Card className="h-full">
            <CardHeader className="h-14 bg-muted animate-pulse rounded-t-md">
              <div />
            </CardHeader>
            <CardContent className="h-32 bg-muted/50 animate-pulse m-4 rounded-md">
              <div />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Grid for Medium & Lower Priority Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-48">
            <CardHeader className="h-12 bg-muted animate-pulse rounded-t-md">
              <div />
            </CardHeader>
            <CardContent className="h-24 bg-muted/50 animate-pulse m-4 rounded-md">
              <div />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
