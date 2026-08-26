import prisma from '../src/lib/prisma.js';

async function main() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log("No users found");
    return;
  }
  const userId = users[0].id;
  const skills = await prisma.skillState.findMany({ where: { userId } });
  console.log("Skills for user:", userId);
  console.log(JSON.stringify(skills, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
