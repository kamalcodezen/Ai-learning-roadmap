'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminSkillProof } from '@/src/lib/api/admin/skill-proof';
import { exportAdminData } from '@/src/lib/actions/admin/export';
import { authClient } from '@/src/lib/auth-client';
import { Label, SearchField, Skeleton } from '@heroui/react';
import { Card, CardContent, CardHeader } from '@/src/components/ui/Card';
import { Award } from 'lucide-react';
import { useDebounce } from 'use-debounce';

export default function AdminSkillProofView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const take = 20;
  const skip = (page - 1) * take;

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminSkillProof', userId, skip, take, debouncedSearch],
    queryFn: () => getAdminSkillProof(userId!, skip, take, debouncedSearch),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1 max-w-md rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load skill proofs. Please try again.</p>
      </div>
    );
  }

  const { proofs, total } = data;
  const totalPages = Math.ceil(total / take) || 1;

  return (
    <Card className="gap-0 p-0 border-[5px] border-[#eae0ff] dark:border-[#5b3491]">
      <CardHeader className="border-b border-border gap-0 p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <SearchField
            className="flex-1 w-full max-w-md"
            value={searchTerm}
            onChange={(val) => { setSearchTerm(val); setPage(1); }}
          >
            <Label>Search</Label>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input className="w-full" placeholder="Search by learner name..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <button
            onClick={() => exportAdminData(userId!, 'skill-proof')}
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
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Learner</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Skill</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Knowledge</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Practice</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Project</th>
                <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {proofs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4">
                    <div className="py-8 text-center text-muted-foreground">
                      No skill proofs found matching your search.
                    </div>
                  </td>
                </tr>
              ) : proofs.map((p: { id: string; user: { name: string; email: string }; skill: string; skillName: string; proofType: string; status: string; submittedAt: string; knowledgeScore: number; practiceScore: number; projectScore: number; evidenceScore: number }) => (
                <tr key={p.id} className="border-t border-[var(--color-border)] hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Award className="size-4" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{p.user.name}</div>
                        <div className="text-xs text-muted-foreground">{p.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-foreground">{p.skillName}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-500">{p.knowledgeScore}%</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-500">{p.practiceScore}%</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-500">{p.projectScore}%</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">{p.evidenceScore}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > take && (
          <div className="flex items-center justify-between border-t border-border px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Showing {skip + 1} to {Math.min(skip + take, total)} of {total}
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
  );
}
