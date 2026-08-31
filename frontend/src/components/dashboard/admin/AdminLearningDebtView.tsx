
'use client';
import { useQuery } from '@tanstack/react-query';
import { getAdminLearningDebt } from '@/src/lib/api/admin/learning-debt';
import { exportAdminData } from '@/src/lib/actions/admin/export';
import { authClient } from '@/src/lib/auth-client';
import { AlertTriangle, Download, GraduationCap, User } from 'lucide-react';
import { Skeleton } from '@heroui/react';
import { Card, CardContent, CardHeader } from '@/src/components/ui/Card';

export default function AdminLearningDebtView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const { data, isLoading } = useQuery({
    queryKey: ['adminLearningDebt', userId],
    queryFn: () => getAdminLearningDebt(userId!),
    enabled: !!userId,
  });

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load learning debt. Please try again.</p>
      </div>
    );
  }

  const { debtRecords } = data;

  return (
    <Card className="gap-0 p-0 border-[5px] border-[#eae0ff] dark:border-[#5b3491]">
      <CardHeader className="border-b border-border gap-0 p-4">
        <div className="flex items-center">
          <p className="flex-1 text-sm text-muted-foreground">Learners ranked by debt across skills.</p>
          <button
            onClick={() => exportAdminData(userId!, 'learning-debt')}
            className="flex items-center gap-2 bg-[var(--color-brand)] text-white h-10 px-4 rounded-md text-sm font-medium hover:brightness-110 transition"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Skill</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Learner</th>
                <th className="p-4 text-right font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Knowledge Score</th>
                <th className="p-4 text-right font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Practice Score</th>
              </tr>
            </thead>
            <tbody>
              {debtRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4">
                    <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                      <GraduationCap className="h-8 w-8 opacity-50" />
                      No learning debt found.
                    </div>
                  </td>
                </tr>
              ) : debtRecords.map((r: { id: string; user: { name: string; email: string }; topic: string; skillName: string; knowledgeScore: number; practiceScore: number }) => (
                <tr key={r.id} className="border-t border-[var(--color-border)] hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                        <AlertTriangle className="size-4" />
                      </div>
                      <div className="font-medium text-foreground">{r.skillName}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{r.user.name}</p>
                        <p className="text-xs text-muted-foreground">{r.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-500/10 text-red-500">
                      {r.knowledgeScore}%
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-500/10 text-red-500">
                      {r.practiceScore}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
