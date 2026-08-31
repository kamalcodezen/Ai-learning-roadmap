import AdminRoadmapsView from "@/src/components/dashboard/admin/AdminRoadmapsView";

export default function AdminRoadmapsPage() {
  return (
    <div className="flex w-full flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Roadmaps</h1>
        <p className="text-muted-foreground">Manage and track learner roadmaps.</p>
      </div>
      <AdminRoadmapsView />
    </div>
  );
}
