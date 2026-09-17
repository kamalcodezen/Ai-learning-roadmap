import { serverFetch } from "../../core/server";

export interface AdminAiUsageItem {
  id: string;
  provider: string;
  model: string;
  feature: string;
  status: string;
  durationMs?: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AdminAiProviderStat {
  provider: string;
  total: number;
  success: number;
  failure: number;
}

export interface AdminAiUsageResponse {
  logs: AdminAiUsageItem[];
  total: number;
  successCount: number;
  failureCount: number;
  providerStats: AdminAiProviderStat[];
}

/**
 * Fetches LLM token consumption metrics, latency statistics, and prompt activity logs.
 */
export const getAdminAiUsage = async (
  userId: string,
  skip = 0,
  take = 20
): Promise<AdminAiUsageResponse> => {
  return await serverFetch(`/api/admin/ai-usage?userId=${userId}&skip=${skip}&take=${take}`);
};
