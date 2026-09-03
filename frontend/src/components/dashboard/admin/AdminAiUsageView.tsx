'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminAiUsage } from '@/src/lib/api/admin/ai-usage';
import { exportAdminData } from '@/src/lib/actions/admin/export';
import { authClient } from '@/src/lib/auth-client';
import { Skeleton } from '@heroui/react';
import { Card, CardContent, CardHeader } from '@/src/components/ui/Card';
import AdminGlowCard from './AdminGlowCard';
import { NumberTicker } from '@/src/registry/magicui/number-ticker';
import { Cpu } from 'lucide-react';

export default function AdminAiUsageView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [page, setPage] = useState(1);
  const take = 20;
  const skip = (page - 1) * take;

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminAiUsage', userId, skip, take],
    queryFn: () => getAdminAiUsage(userId!, skip, take),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load AI usage data. Please try again.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.total / take) || 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AdminGlowCard>
          <p className="text-sm text-muted-foreground">Total AI Calls</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-secondary)]">
            <NumberTicker value={data.total} />
          </p>
        </AdminGlowCard>
        <AdminGlowCard>
          <p className="text-sm text-muted-foreground">Success</p>
          <p className="mt-2 text-3xl font-bold text-green-500">
            <NumberTicker value={data.successCount} />
          </p>
        </AdminGlowCard>
        <AdminGlowCard>
          <p className="text-sm text-muted-foreground">Failures</p>
          <p className="mt-2 text-3xl font-bold text-red-500">
            <NumberTicker value={data.failureCount} />
          </p>
        </AdminGlowCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.providerStats.map((p: { provider: string; total: number; success: number; failure: number }) => (
          <AdminGlowCard key={p.provider}>
            <p className="text-lg font-bold text-foreground mb-2">{p.provider}</p>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total:</span><span className="font-medium">{p.total}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Success:</span><span className="text-green-500 font-medium">{p.success}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Failure:</span><span className="text-red-500 font-medium">{p.failure}</span></div>
          </AdminGlowCard>
        ))}
      </div>

      <Card className="gap-0 p-0 border-[5px] border-[#eae0ff] dark:border-[#5b3491]">
        <CardHeader className="border-b border-border gap-0 p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => exportAdminData(userId!, 'ai-usage')}
              className="w-full sm:w-auto bg-[var(--color-brand)] text-white h-10 px-4 rounded-md text-sm font-medium hover:brightness-110 transition"
            >
              Export CSV
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Provider</th>
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Feature</th>
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Status</th>
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4">
                      <div className="py-8 text-center text-muted-foreground">
                        No AI usage logs found.
                      </div>
                    </td>
                  </tr>
                ) : data.logs.map((a: { id: string; provider: string; model: string; feature: string; status: string; createdAt: string }) => (
                  <tr key={a.id} className="border-t border-[var(--color-border)] hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Cpu className="size-4" />
                        </div>
                        <div className="font-medium text-foreground">{a.provider} ({a.model})</div>
                      </div>
                    </td>
                    <td className="p-4">{a.feature}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${a.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.total > take && (
            <div className="flex items-center justify-between border-t border-border px-4 py-4">
              <p className="text-sm text-muted-foreground">
                Showing {skip + 1} to {Math.min(skip + take, data.total)} of {data.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  className="px-4 py-1.5 text-sm rounded-md bg-[var(--color-muted)] text-foreground font-medium hover:brightness-110 disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-1.5 text-sm rounded-md bg-[var(--color-primary)] text-white font-medium hover:brightness-110 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
