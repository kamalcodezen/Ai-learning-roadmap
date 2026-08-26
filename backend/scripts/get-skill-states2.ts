import prisma from '../src/lib/prisma.js';

async function main() {
  const profiles = await prisma.careerProfile.findMany({ include: { user: true } });
  console.log("Profiles:", profiles.map(p => ({ user: p.userId, role: p.targetRoleName || p.targetRole })));
  
  const htmlSkill = await prisma.skillState.findFirst({ where: { skillName: 'HTML' } });
  console.log("HTML skill:", htmlSkill);
}

main().catch(console.error).finally(() => prisma.$disconnect());
