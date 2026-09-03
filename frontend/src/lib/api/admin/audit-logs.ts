import { serverFetch } from "../../core/server";

export interface AdminAuditLogResult {
  logs: Array<{
    id: string;
    action: string;
    targetId: string | null;
    details: Record<string, unknown>
    createdAt: string;
    admin: { name: string; email: string };
  }>;
  total: number;
}

export const getAdminAuditLogs = async (userId: string, skip = 0, take = 20): Promise<AdminAuditLogResult> => {
  return await serverFetch(`/api/admin/audit-logs?userId=${userId}&skip=${skip}&take=${take}`);
};
