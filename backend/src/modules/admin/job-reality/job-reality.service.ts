import prisma from "../../../lib/prisma.js";

export const getAdminJobReality = async () => {
  const profiles = await prisma.careerProfile.findMany({
    select: { targetRole: true }
  });
  
  const roleAgg = new Map<string, number>();
  profiles.forEach((p: any) => {
    roleAgg.set(p.targetRole, (roleAgg.get(p.targetRole) || 0) + 1);
  });
  
  const popularRoles = Array.from(roleAgg.entries()).map(([role, count]) => ({ role, count })).sort((a: any, b: any) => b.count - a.count);
  return { popularRoles, totalChecks: profiles.length };
};
