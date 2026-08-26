import prisma from "../src/lib/prisma.js";
import { seedDiagnosticQuestions } from "./seed/diagnostic.questions.js";

async function main() {
  console.log("Starting database seed...");

  await seedDiagnosticQuestions(prisma);

  console.log("Database seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
