import AuditLogsView from "@/src/components/dashboard/admin/AuditLogsView";

export default function AuditLogsPage() {
  return (
    <div className="flex w-full flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">View security and administrative actions taken across the platform.</p>
      </div>
      <AuditLogsView />
    </div>
  );
}
