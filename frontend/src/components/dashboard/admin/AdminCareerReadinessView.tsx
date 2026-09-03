'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminCareerReadiness } from "@/src/lib/api/admin/career-readiness";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { User, Target } from "lucide-react";
import { useDebounce } from "use-debounce";
import {
  Label,
  SearchField,
  Skeleton,
} from "@heroui/react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";
import AdminGlowCard from "./AdminGlowCard";
import { NumberTicker } from "@/src/registry/magicui/number-ticker";

export default function AdminCareerReadinessView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminCareerReadiness", userId],
    queryFn: () => getAdminCareerReadiness(userId!),
    enabled: !!userId,
  });

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load career readiness data. Please try again.</p>
      </div>
    );
  }

  const { profiles, summary } = data;

  const stats = [
    { label: "Ready", value: summary.ready },
    { label: "Almost Ready", value: summary.almost },
    { label: "Needs Work", value: summary.needsWork },
    { label: "Early Stage", value: summary.early },
  ];

  const filtered = profiles.filter((p: { user: { name: string }; targetRole: string }) => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return true;
    return (
      p.user.name.toLowerCase().includes(q) ||
      p.targetRole.toLowerCase().includes(q)
    );
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500/10 text-green-500";
    if (score >= 50) return "bg-orange-500/10 text-orange-500";
    return "bg-red-500/10 text-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <AdminGlowCard key={s.label}>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-[var(--color-secondary)]">
              <NumberTicker value={s.value} />
            </p>
          </AdminGlowCard>
        ))}
      </div>

      <Card className="gap-0 p-0 border-[5px] border-[#eae0ff] dark:border-[#5b3491]">
        <CardHeader className="border-b border-border gap-0 p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <SearchField
              className="flex-1 w-full max-w-md"
              value={searchTerm}
              onChange={(val) => setSearchTerm(val)}
            >
              <Label>Search</Label>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input className="w-full" placeholder="Search by learner name or target role..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <button
              onClick={() => exportAdminData(userId!, "career-readiness")}
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
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Target Role</th>
                  <th className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider">Readiness Score</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4">
                      <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                        <Target className="h-8 w-8 opacity-50" />
                        No data found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p: { id: string; user: { name: string; email: string }; matchRole: string; score: number; targetRole: string }) => (
                    <tr key={p.id} className="border-t border-[var(--color-border)] hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <User className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{p.user.name}</p>
                            <p className="text-xs text-muted-foreground">{p.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-foreground">{p.targetRole}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getScoreColor(p.score)}`}>
                          {p.score}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
