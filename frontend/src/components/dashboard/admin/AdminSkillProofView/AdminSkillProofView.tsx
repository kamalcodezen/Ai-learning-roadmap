"use client";
import { StatusBadge } from "@/src/components/dashboard/shared/patterns";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminSkillProof, AdminSkillProofItem } from "@/src/lib/api/admin/skill-proof";
import { exportAdminData } from "@/src/lib/actions/admin/export";
import { authClient } from "@/src/lib/auth-client";
import AdminPageSkeleton from "@/src/components/dashboard/admin/shared/AdminPageSkeleton";
import { Award } from "lucide-react";
import { useDebounce } from "use-debounce";
import AdminDataTable from "@/src/components/dashboard/admin/shared/AdminDataTable";
import type { AdminDataTableColumn } from "@/src/components/dashboard/admin/shared/AdminDataTable";

const columns: AdminDataTableColumn<AdminSkillProofItem>[] = [
  {
    header: "Learner",
    render: (p) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Award className="size-4" />
        </div>
        <div>
          <div className="font-medium text-foreground">{p.user?.name || "Unknown"}</div>
          <div className="text-xs text-muted-foreground">{p.user?.email || "No email"}</div>
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
    align: "center",
    render: (p) => (
      <div className="flex justify-center">
        <StatusBadge tone="blue">{p.knowledgeScore}%</StatusBadge>
      </div>
    ),
  },
  {
    header: "Practice",
    align: "center",
    render: (p) => (
      <div className="flex justify-center">
        <StatusBadge tone="blue">{p.practiceScore}%</StatusBadge>
      </div>
    ),
  },
  {
    header: "Project",
    align: "center",
    render: (p) => (
      <div className="flex justify-center">
        <StatusBadge tone="blue">{p.projectScore}%</StatusBadge>
      </div>
    ),
  },
  {
    header: "Evidence",
    align: "center",
    render: (p) => (
      <div className="flex justify-center">
        <StatusBadge tone="primary">{p.evidenceScore}%</StatusBadge>
      </div>
    ),
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

  if (isLoading && !data) {
    return (
      <AdminPageSkeleton
        variant="table"
        hasKpis={false}
        hasSearch={true}
        hasToolbar={true}
        dropdownCount={0}
      />
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
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">
            Skill <span className="text-brand">Proof</span>
          </h1>
          <p className="section-subtitle mt-1 text-left">
            Review submitted skill proofs and scores across the platform.
          </p>
        </div>
      </div>

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
    </div>
  );
}
