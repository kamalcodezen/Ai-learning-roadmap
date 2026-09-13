import { config } from "dotenv";
config();
import prisma from "../src/lib/prisma.js";

async function main() {
  const latestCompleted = await prisma.diagnosticAttempt.findFirst({
    where: { status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    include: {
      answers: {
        include: { question: true },
        orderBy: { question: { order: "asc" } },
      },
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  if (!latestCompleted) {
    console.log("No completed attempt found in database.");
    return;
  }

  const profile = await prisma.careerProfile.findUnique({ where: { userId: latestCompleted.userId } });
  console.log("Attempt TargetRole:", latestCompleted.targetRole);
  console.log("Profile TargetRole:", profile?.targetRole, "Profile RoleName:", profile?.targetRoleName);

  const { getDashboardOverview } = await import("../src/modules/learner/dashboard/services/dashboard.service.js");
  const dashboardData = await getDashboardOverview(latestCompleted.userId);
  console.log("\n=== DASHBOARD OVERVIEW DATA RETURNED ===");
  console.log("Readiness Score:", dashboardData.readiness?.score);
  console.log("Readiness Dimensions:", dashboardData.readiness);
  console.log("Career TargetRole:", dashboardData.career?.targetRole);
  console.log("Roadmap Progress:", dashboardData.roadmap?.progress);
  console.log("Skills Tracked Count:", dashboardData.skills?.length);
  console.log("Proof Summary:", dashboardData.proof);
  console.log("Total Questions:", latestCompleted.totalQuestions);
  console.log("Answered Questions:", latestCompleted.answeredQuestions);
  console.log("Started At:", latestCompleted.startedAt);
  console.log("Completed At:", latestCompleted.completedAt);
  console.log("\n--- ANSWERS AUDIT ---");

  let mcqCount = 0;
  let correctMcq = 0;
  const skillsMap: Record<string, { total: number; correct: number }> = {};

  for (const ans of latestCompleted.answers) {
    const q = ans.question;
    const isComm = q.order === 6;
    console.log(`\nQ${q.order} [${isComm ? 'COMMUNICATION' : 'MCQ'}] Skill: "${q.skill}" Category: "${q.category}"`);
    console.log(`  Question: ${q.question}`);
    console.log(`  Selected Answer: "${ans.selectedAnswer}"`);
    console.log(`  Correct Answer:  "${q.correctAnswer}"`);
    console.log(`  isCorrect in DB: ${ans.isCorrect}`);

    if (!isComm) {
      mcqCount++;
      if (ans.isCorrect) correctMcq++;

      const s = q.skill || "General";
      if (!skillsMap[s]) skillsMap[s] = { total: 0, correct: 0 };
      skillsMap[s].total++;
      if (ans.isCorrect) skillsMap[s].correct++;
    } else {
      console.log(`  Evaluation JSON:`, JSON.stringify(ans.evaluation, null, 2));
    }
  }

  console.log("\n=== COMPUTED TOTALS ===");
  console.log(`MCQ Count: ${mcqCount}`);
  console.log(`Correct MCQ: ${correctMcq}`);
  console.log(`Overall MCQ Score: ${Math.round((correctMcq / mcqCount) * 100)}%`);
  console.log("Skill Breakdowns:");
  for (const [s, data] of Object.entries(skillsMap)) {
    const pct = Math.round((data.correct / data.total) * 100);
    console.log(`  - ${s}: ${pct}% (${data.correct}/${data.total})`);
  }

  console.log("\n=== SKILL STATE IN DB FOR THIS USER ===");
  await prisma.skillState.deleteMany({
    where: { skillName: "Technical Communication" },
  });
  const skillStates = await prisma.skillState.findMany({
    where: { userId: latestCompleted.userId },
  });
  console.log(JSON.stringify(skillStates, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
