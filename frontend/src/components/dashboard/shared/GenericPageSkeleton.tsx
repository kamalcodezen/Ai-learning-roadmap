import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";

export default function GenericPageSkeleton() {
  return (
    <div className="flex h-[94vh] w-full flex-col overflow-y-hidden animate-in fade-in duration-500 dashboard-card-gap">
      {/* Header Skeleton */}
      <div className="flex h-[12%] shrink-0 flex-col items-start justify-center gap-3">
        <div className="h-[30%] w-1/3 bg-muted animate-pulse rounded" />
        <div className="h-[30%] w-1/2 bg-muted animate-pulse rounded" />
      </div>

      {/* Card Grid Skeleton */}
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-6 sm:grid-cols-2 sm:grid-rows-3 lg:grid-cols-3 lg:grid-rows-2 dashboard-card-gap">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-full">
            <CardHeader className="h-[20%] shrink-0 bg-muted animate-pulse rounded-t-md">
              <div />
            </CardHeader>
            <CardContent className="h-[70%] bg-muted/50 animate-pulse m-4 rounded-md">
              <div className="flex items-center justify-center h-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}