import { serverFetch } from "../../core/server";

export interface AdminActivityItem {
  id: string;
  userId: string;
  type: string;
  description: string;
  createdAt: string;
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

export interface AdminActivityResponse {
  activity: AdminActivityItem[];
  total: number;
}

/**
 * Fetches platform-wide real-time activity and event audit streams.
 */
export const getAdminActivity = async (
  userId: string,
  skip = 0,
  take = 20
): Promise<AdminActivityResponse> => {
  return await serverFetch(`/api/admin/activity?userId=${userId}&skip=${skip}&take=${take}`);
};
