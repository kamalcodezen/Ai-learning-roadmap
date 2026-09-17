import { serverFetch } from "../../core/server";

export interface AdminAuditLogItem {
  id: string;
  action: string;
  targetId: string | null;
  details: Record<string, unknown>;
  createdAt: string;
  admin: { name: string; email: string };
}

export interface AdminAuditLogResult {
  logs: AdminAuditLogItem[];
  total: number;
}

/**
 * Fetches platform-wide security audit trails and administrative action history.
 */
export const getAdminAuditLogs = async (
  userId: string,
  skip = 0,
  take = 20
): Promise<AdminAuditLogResult> => {
  return await serverFetch(`/api/admin/audit-logs?userId=${userId}&skip=${skip}&take=${take}`);
};
