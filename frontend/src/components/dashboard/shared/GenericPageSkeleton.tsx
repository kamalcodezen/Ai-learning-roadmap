import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";

export default function GenericPageSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-500">
      <div className="flex flex-col gap-3">
        <div className="h-10 w-1/3 bg-muted animate-pulse rounded" />
        <div className="h-5 w-1/2 bg-muted animate-pulse rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-48">
            <CardHeader className="h-12 bg-muted animate-pulse rounded-t-md">
              <div />
            </CardHeader>
            <CardContent className="h-24 bg-muted/50 animate-pulse m-4 rounded-md">
              <div className="flex items-center justify-center h-full">
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
