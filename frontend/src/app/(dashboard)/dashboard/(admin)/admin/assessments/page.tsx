import AdminAssessmentsView from "@/src/components/dashboard/admin/AdminAssessmentsView";

export default function AdminAssessmentsPage() {
  return (
    <div className="flex w-full flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Assessments</h1>
        <p className="text-muted-foreground">View platform-wide assessment analytics.</p>
      </div>
      <AdminAssessmentsView />
    </div>
  );
}
