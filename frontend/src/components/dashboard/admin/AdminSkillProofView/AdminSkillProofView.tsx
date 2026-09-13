"use client";
import { StatusBadge } from "@/src/components/dashboard/shared/patterns";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminSkillProof } from "@/src/lib/api/admin/skill-proof";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import { Skeleton } from "@heroui/react";
import { Award } from "lucide-react";
import { useDebounce } from "use-debounce";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";

interface SkillProofRow {
  id: string;
  user: { name: string; email: string };
  skill: string;
  skillName: string;
  proofType: string;
  status: string;
  submittedAt: string;
  knowledgeScore: number;
  practiceScore: number;
  projectScore: number;
  evidenceScore: number;
}

const columns: AdminDataTableColumn<SkillProofRow>[] = [
  {
    header: "Learner",
    render: (p) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Award className="size-4" />
        </div>
        <div>
          <div className="font-medium text-foreground">{p.user.name}</div>
          <div className="text-xs text-muted-foreground">{p.user.email}</div>
        </div>
      </div>
    ),
  },
  {
    header: "Skill",
    render: (p) => (
      <span className="font-medium text-foreground">{p.skillName}</span>
    ),
  },
  {
    header: "Knowledge",
    render: (p) => <StatusBadge tone="blue">{p.knowledgeScore}%</StatusBadge>,
  },
  {
    header: "Practice",
    render: (p) => <StatusBadge tone="blue">{p.practiceScore}%</StatusBadge>,
  },
  {
    header: "Project",
    render: (p) => <StatusBadge tone="blue">{p.projectScore}%</StatusBadge>,
  },
  {
    header: "Evidence",
    render: (p) => <StatusBadge tone="primary">{p.evidenceScore}%</StatusBadge>,
  },
];

export default function AdminSkillProofView() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const take = 20;
  const skip = (page - 1) * take;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminSkillProof", userId, skip, take, debouncedSearch],
    queryFn: () => getAdminSkillProof(userId!, skip, take, debouncedSearch),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-500 font-medium">
          Unable to load skill proofs. Please try again.
        </p>
      </div>
    );
  }

  const { proofs, total } = data;

  return (
    <AdminDataTable
      columns={columns}
      rows={proofs}
      rowKey={(p) => p.id}
      emptyMessage="No skill proofs found matching your search."
      searchTerm={searchTerm}
      onSearchChange={(val) => {
        setSearchTerm(val);
        setPage(1);
      }}
      searchPlaceholder="Search by learner name..."
      exportCsv={() => exportAdminData(userId!, "skill-proof")}
      page={page}
      take={take}
      total={total}
      onPageChange={setPage}
    />
  );
}
