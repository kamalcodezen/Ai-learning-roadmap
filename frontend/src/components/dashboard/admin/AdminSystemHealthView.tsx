"use client";

import { useQuery } from "@tanstack/react-query";
import { serverFetch } from "@/src/lib/core/server";
import { authClient } from "@/src/lib/auth-client";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Skeleton } from "@heroui/react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";

const services = [
  { key: "database", label: "Database" },
  { key: "backend", label: "Backend API" },
  { key: "auth", label: "Authentication" },
  { key: "ai", label: "AI Providers" },
] as const;

function statusBadge(status: string) {
  const lower = status.toLowerCase();
  const isOk = lower === "ok" || lower === "online" || lower === "healthy" || lower === "connected";
  const isErr = lower === "error" || lower === "offline" || lower === "down" || lower === "failed" || lower === "disconnected";

  if (isOk) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-500/10 text-green-500">
        <CheckCircle className="w-3 h-3" />
        {status}
      </span>
    );
  }
  if (isErr) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-500/10 text-red-500">
        <XCircle className="w-3 h-3" />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-orange-500/10 text-orange-500">
      <AlertCircle className="w-3 h-3" />
      {status}
    </span>
  );
}

export default function AdminSystemHealthView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["adminSystemHealth", userId],
    queryFn: () => serverFetch(`/api/admin/system-health?userId=${userId}`),
    enabled: !!userId,
  });

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load system health. Please try again.</p>
      </div>
    );
  }

  return (
    <Card className="gap-0 p-0 border-[5px] border-[#eae0ff] dark:border-[#5b3491]">
      <CardHeader className="border-b border-border gap-0 p-4">
        <p className="text-sm text-muted-foreground">Current status of all platform services.</p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Service</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr key={svc.key} className="border-t border-[var(--color-border)] hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{svc.label}</td>
                  <td className="p-4">{statusBadge(data[svc.key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
