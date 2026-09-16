import { serverFetch } from "../../core/server";

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  plan?: string;
  createdAt: string;
  image?: string | null;
}

export interface AdminUserListResult {
  users: AdminUserListItem[];
  total: number;
}

/**
 * Retrieves paginated user profiles with filtering by search keywords, role, and registration date.
 */
export const getAdminUsers = async (
  userId: string,
  skip = 0,
  take = 10,
  search = "",
  role = "",
  days?: number
): Promise<AdminUserListResult> => {
  const query = new URLSearchParams({
    userId,
    skip: skip.toString(),
    take: take.toString(),
  });
  if (search) query.append("search", search);
  if (role) query.append("role", role);
  if (days) query.append("days", days.toString());

  return await serverFetch(`/api/admin/users?${query.toString()}`);
};
