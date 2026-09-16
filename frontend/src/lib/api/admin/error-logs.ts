import { serverFetch } from "../../core/server";

export interface AdminErrorLogItem {
  id: string;
  errorType: string;
  message: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  userId?: string;
  createdAt: string;
}

export interface AdminErrorLogsResponse {
  logs: AdminErrorLogItem[];
  total: number;
}

/**
 * Fetches platform runtime exception records and server error logs.
 */
export const getAdminErrorLogs = async (
  userId: string,
  skip = 0,
  take = 20
): Promise<AdminErrorLogsResponse> => {
  return await serverFetch(`/api/admin/error-logs?userId=${userId}&skip=${skip}&take=${take}`);
};
