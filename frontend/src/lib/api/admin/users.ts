import { serverFetch } from "../../core/server";

export interface AdminUserListResult {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  total: number;
}

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
