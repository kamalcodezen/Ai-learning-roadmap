import { Card, CardContent } from "@/src/components/ui/Card";

export default function LearningPathSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12 w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-3 w-full max-w-md">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shrink-0 min-w-[200px] h-24 flex flex-col justify-between">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          <div className="h-2 w-full bg-muted animate-pulse rounded-full" />
        </div>
      </div>

      {/* Timeline Skeleton */}
      <div className="flex flex-col relative">
        <div className="absolute left-[27px] top-4 bottom-12 w-0.5 bg-border z-0 hidden md:block" />

        <div className="flex flex-col gap-6 relative z-10">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-4 md:gap-8">
              {/* Timeline Node Skeleton */}
              <div className="hidden md:flex flex-col items-center pt-5">
                <div className="w-14 h-14 rounded-full bg-muted border-4 border-background animate-pulse" />
              </div>

              {/* Card Skeleton */}
              <Card className="flex-1 rounded-md border-2 border-background shadow-none">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-3">
                        <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
                        <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-4 w-full bg-muted animate-pulse rounded" />
                      <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                      
                      <div className="h-16 w-full bg-muted/50 animate-pulse rounded-lg mt-4" />
                      
                      <div className="flex gap-4 mt-2">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      </div>
                    </div>

                    <div className="lg:w-48 flex flex-col justify-center gap-4 lg:border-l lg:border-border lg:pl-6 shrink-0">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                          <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="h-2 w-full bg-muted animate-pulse rounded-full" />
                      </div>
                      <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
