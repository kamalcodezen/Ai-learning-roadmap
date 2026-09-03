import { serverMutation } from "../../core/server";

export const updateAdminUserRole = async (adminId: string, targetUserId: string, newRole: string) => {
  return await serverMutation(`/api/admin/users/${targetUserId}/role?userId=${adminId}`, { role: newRole }, "PATCH");
};

export const deleteAdminUser = async (adminId: string, targetUserId: string) => {
  return await serverMutation(`/api/admin/users/${targetUserId}?userId=${adminId}`, undefined, "DELETE");
};
