import { serverMutation } from "../../core/server";

export const verifyAdminProject = async (
  adminId: string,
  projectId: string,
  isVerified: boolean,
  score?: number
) => {
  return await serverMutation(
    `/api/admin/projects/${projectId}/verify?userId=${adminId}`,
    { isVerified, score },
    "PATCH"
  );
};
