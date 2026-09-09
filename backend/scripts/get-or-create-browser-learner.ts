import { config } from "dotenv";
config();
import prisma from "../src/lib/prisma.js";

async function main() {
  const email = "browser-test-learner@example.com";
  let user = await prisma.user.findFirst({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: "browser-learner-user-id",
        name: "Browser Test Learner",
        email,
        emailVerified: true,
        role: "LEARNER",
      },
    });
  }

  await prisma.careerProfile.upsert({
    where: { userId: user.id },
    update: {
      targetRole: "Full Stack Developer",
      targetRoleName: "Full Stack Developer",
      onboardingCompleted: true,
      experienceLevel: "INTERMEDIATE",
    },
    create: {
      userId: user.id,
      targetRole: "Full Stack Developer",
      targetRoleName: "Full Stack Developer",
      onboardingCompleted: true,
      experienceLevel: "INTERMEDIATE",
    },
  });

  // Create a session token directly in the database so we can authenticate in browser cookies or test directly
  const token = "browser-test-session-token-12345";
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await prisma.session.upsert({
    where: { token },
    update: { expiresAt },
    create: {
      id: "browser-session-id-123",
      token,
      userId: user.id,
      expiresAt,
    },
  });

  console.log("SUCCESS: Session created for user", user.id);
}

main().catch(console.error);
