'use client';
import { useQuery } from '@tanstack/react-query';
import { getAdminJobReality } from '@/src/lib/api/admin/job-reality';
import { exportAdminData } from '@/src/lib/actions/admin/export';
import { authClient } from '@/src/lib/auth-client';
import { Skeleton } from '@heroui/react';
import { Card, CardContent, CardHeader } from '@/src/components/ui/Card';
import AdminGlowCard from './AdminGlowCard';
import { NumberTicker } from '@/src/registry/magicui/number-ticker';
import { Briefcase } from 'lucide-react';

export default function AdminJobRealityView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminJobReality', userId],
    queryFn: () => getAdminJobReality(userId!),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-64 rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load job reality data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminGlowCard>
          <p className="text-sm text-muted-foreground">Total Job Checks</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-secondary)]">
            <NumberTicker value={data.totalChecks} />
          </p>
        </AdminGlowCard>
      </div>

      <Card className="gap-0 p-0 border-[5px] border-[#eae0ff] dark:border-[#5b3491]">
        <CardHeader className="border-b border-border gap-0 p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => exportAdminData(userId!, 'job-reality')}
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
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Target Role</th>
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Number of Learners</th>
                </tr>
              </thead>
              <tbody>
                {data.popularRoles.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-4">
                      <div className="py-8 text-center text-muted-foreground">
                        No job reality data found.
                      </div>
                    </td>
                  </tr>
                ) : data.popularRoles.map((r: { id: string; role: string; mismatchScore: number; activeUsers: number; count: number }) => (
                  <tr key={r.role} className="border-t border-[var(--color-border)] hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Briefcase className="size-4" />
                        </div>
                        <div className="font-medium text-foreground">{r.role}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                        <NumberTicker value={r.count} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
