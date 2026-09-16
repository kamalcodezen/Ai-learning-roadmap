import { serverFetch, serverMutation } from "../../core/server";

export interface CreateBroadcastPayload {
  title: string;
  message: string;
  targetCohort: "ALL" | "FREE" | "PLUS" | "PRO";
  priority: "NORMAL" | "HIGH" | "URGENT";
  actionUrl?: string;
}

export interface BroadcastTransmissionItem {
  id: string;
  title: string;
  message: string;
  targetCohort: string;
  priority: string;
  actionUrl?: string;
  recipientsCount: number;
  sentAt: string;
  senderName: string;
}

export interface AdminBroadcastsResponse {
  broadcasts: BroadcastTransmissionItem[];
  stats: {
    totalBroadcastsSent: number;
    totalLearners: number;
    cohortBreakdown: {
      ALL: number;
      FREE: number;
      PLUS: number;
      PRO: number;
    };
  };
}

/**
 * Fetches broadcast transmission history and cohort reach metrics.
 */
export const getAdminBroadcasts = async (userId: string): Promise<AdminBroadcastsResponse> => {
  return await serverFetch(`/api/admin/broadcasts?userId=${userId}`);
};

/**
 * Dispatches a real-time broadcast announcement to learners in bulk.
 */
export const createAdminBroadcast = async (
  userId: string,
  payload: CreateBroadcastPayload
): Promise<BroadcastTransmissionItem> => {
  return await serverMutation(`/api/admin/broadcasts?userId=${userId}`, payload, "POST");
};
