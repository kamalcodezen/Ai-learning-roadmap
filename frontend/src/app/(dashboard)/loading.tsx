export default function DashboardLoading() {
  return (
    <main className="h-[90vh] w-full">

    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <div className="jimu-primary-loading" />
      <p className="text-sm font-medium text-muted-foreground mt-20 animate-pulse">
        Getting your paths...
      </p>
    </div>
    </main>
  );
}
