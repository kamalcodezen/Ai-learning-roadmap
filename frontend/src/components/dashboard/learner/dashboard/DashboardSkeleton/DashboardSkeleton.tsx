export default function DashboardSkeleton() {
  return (
    <div className="flex h-[94vh] w-full flex-col overflow-y-hidden dashboard-card-gap">
      {/* Welcome Banner Skeleton */}
      <div className="w-full h-[18%] shrink-0 bg-primary/10 animate-pulse rounded-md border border-primary/10" />

      {/* High Priority Grid Skeleton */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-3 dashboard-card-gap">
        {/* Overall Progress Skeleton */}
        <div className="col-auto lg:col-span-1">
          <div className="skeleton-card h-full">
            <div className="h-[25%] bg-primary/10 animate-pulse rounded-t-md">
              <div />
            </div>
            <div className="h-[65%] bg-primary/5 animate-pulse m-4 rounded-md">
              <div />
            </div>
          </div>
        </div>
        {/* Next Best Action Skeleton */}
        <div className="col-auto lg:col-span-1 h-full">
          <div className="skeleton-card h-full">
            <div className="h-[25%] bg-primary/10 animate-pulse rounded-t-md">
              <div />
            </div>
            <div className="h-[65%] bg-primary/5 animate-pulse m-4 rounded-md">
              <div />
            </div>
          </div>
        </div>
        {/* Short Roadmap Skeleton */}
        <div className="col-auto lg:col-span-1 h-full">
          <div className="skeleton-card h-full">
            <div className="h-[25%] bg-primary/10 animate-pulse rounded-t-md">
              <div />
            </div>
            <div className="h-[65%] bg-primary/5 animate-pulse m-4 rounded-md">
              <div />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid for Medium & Lower Priority Skeleton */}
      <div className="grid h-[38%] shrink-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 dashboard-card-gap">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-card h-full">
            <div className="h-[20%] bg-primary/10 animate-pulse rounded-t-md">
              <div />
            </div>
            <div className="h-[70%] bg-primary/5 animate-pulse m-4 rounded-md">
              <div />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}