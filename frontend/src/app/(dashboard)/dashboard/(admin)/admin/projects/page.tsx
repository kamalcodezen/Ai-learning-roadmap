import AdminProjectsView from "@/src/components/dashboard/admin/AdminProjectsView";

export default function AdminProjectsPage() {
  return (
    <div className="flex w-full flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
        <p className="text-muted-foreground">Track learner projects and portfolio evidence.</p>
      </div>
      <AdminProjectsView />
    </div>
  );
}
