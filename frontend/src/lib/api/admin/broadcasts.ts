import { serverFetch, serverMutation } from "../../core/server";

export interface CreateBroadcastPayload {
  title: string;
  message: string;
  targetCohort: "ALL" | "FREE" | "PLUS" | "PRO";
  priority: "NORMAL" | "HIGH" | "URGENT";
  actionUrl?: string;
}

export const getAdminBroadcasts = async (userId: string) => {
  return await serverFetch(`/api/admin/broadcasts?userId=${userId}`);
};

export const createAdminBroadcast = async (userId: string, payload: CreateBroadcastPayload) => {
  return await serverMutation(`/api/admin/broadcasts?userId=${userId}`, payload, "POST");
};
