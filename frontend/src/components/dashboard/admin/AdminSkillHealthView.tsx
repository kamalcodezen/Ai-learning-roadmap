"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminSkillHealth } from "@/src/lib/api/admin/skill-health";
import { authClient } from "@/src/lib/auth-client";
import { Zap, TrendingDown } from "lucide-react";
import { Skeleton } from "@heroui/react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";

export default function AdminSkillHealthView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["adminSkillHealth", userId],
    queryFn: () => getAdminSkillHealth(userId!),
    enabled: !!userId,
  });

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">Unable to load skill health data. Please try again.</p>
      </div>
    );
  }

  type Skill = { id: string; name: string; category: string; averageProficiency: number; activeLearners: number; averageScore: number };

  const renderSkillRows = (skills: Skill[], variant: "strong" | "weak") => (
    skills.map((s) => (
      <div key={s.id} className="flex items-center justify-between border-t border-[var(--color-border)] py-3 px-4 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${variant === "strong" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
            {variant === "strong" ? <Zap className="size-4" /> : <TrendingDown className="size-4" />}
          </div>
          <div>
            <div className="font-medium text-foreground">{s.name}</div>
            <div className="text-xs text-muted-foreground">{s.category}</div>
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variant === "strong" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
          {s.averageScore}%
        </span>
      </div>
    ))
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="gap-0 p-0 border-[5px] border-[#eae0ff] dark:border-[#5b3491]">
        <CardHeader className="border-b border-border gap-0 p-4">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-green-500" />
            <h2 className="text-sm font-medium">Strong Skills</h2>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {data.strongSkills.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No strong skills found.</p>
          ) : (
            renderSkillRows(data.strongSkills, "strong")
          )}
        </CardContent>
      </Card>

      <Card className="gap-0 p-0 border-[5px] border-[#eae0ff] dark:border-[#5b3491]">
        <CardHeader className="border-b border-border gap-0 p-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="size-4 text-red-500" />
            <h2 className="text-sm font-medium">Weak Skills / Learning Debt</h2>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {data.weakSkills.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No weak skills found.</p>
          ) : (
            renderSkillRows(data.weakSkills, "weak")
          )}
        </CardContent>
      </Card>
    </div>
  );
}
