import { config } from "dotenv";
config();
import prisma from "../src/lib/prisma.js";

async function main() {
  const userId = "browser-learner-user-id";
  const token = "browser-test-session-token-12345";
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  // Clear existing in-progress attempts so browser gets fresh start
  await prisma.diagnosticAttempt.deleteMany({
    where: { userId },
  });

  await prisma.session.upsert({
    where: { token },
    update: { expiresAt },
    create: {
      id: "browser-session-id-123",
      token,
      userId,
      expiresAt,
    },
  });

  console.log("Ready for browser test: cleared previous attempts, refreshed session for user", userId);
}

main().catch(console.error);
