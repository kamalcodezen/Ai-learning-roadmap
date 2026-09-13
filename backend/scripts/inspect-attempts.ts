import { config } from "dotenv";
config();
import prisma from "../src/lib/prisma.js";

async function main() {
  const latest = await prisma.diagnosticAttempt.findFirst({
    where: { status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
  });
  const userId = latest?.userId || "AMhLdeSmmnGZCsQSwqVE8RItuFNoTXkb";
  console.log("Inspecting for User ID:", userId);

  const profile = await prisma.careerProfile.findUnique({ where: { userId } });
  console.log("Profile:", profile);

  const attempts = await prisma.diagnosticAttempt.findMany({
    where: { userId },
    orderBy: { startedAt: "asc" },
    include: {
      answers: {
        include: { question: true },
        orderBy: { question: { order: "asc" } }
      }
    }
  });

  console.log(`Found ${attempts.length} attempts for user:`);
  for (let i = 0; i < attempts.length; i++) {
    const a = attempts[i];
    console.log(`\n=== ATTEMPT #${i + 1} ID: ${a.id} status: ${a.status} targetRole: "${a.targetRole}" score: ${a.score} completedAt: ${a.completedAt}`);
    for (const ans of a.answers) {
      console.log(`  [Q${ans.question.order}] skill="${ans.question.skill}" category="${ans.question.category}" isCorrect=${ans.isCorrect}`);
      console.log(`    question: "${ans.question.question.slice(0, 70)}"`);
    }
  }

  const skillStates = await prisma.skillState.findMany({
    where: { userId },
    orderBy: { lastReviewed: "desc" }
  });
  console.log(`\n=== SKILL STATES IN DB (${skillStates.length}):`);
  for (const s of skillStates) {
    console.log(`  - "${s.skillName}": knowledge=${s.knowledgeScore} practice=${s.practiceScore} evidence=${s.evidenceScore} lastReviewed=${s.lastReviewed}`);
  }

  const { getOrGenerateLearningPath } = await import("../src/modules/learner/roadmap/services/learning-path.service.js");
  await getOrGenerateLearningPath(userId);

  const roadmaps = await prisma.roadmap.findMany({
    where: { userId },
    include: {
      milestones: {
        orderBy: { order: "asc" }
      }
    }
  });
  console.log("\n=== ROADMAPS IN DB ===");
  for (const r of roadmaps) {
    console.log(`Roadmap ID: ${r.id} status: ${r.status} targetRole: ${r.targetRole}`);
    for (const m of r.milestones) {
      console.log(`  Milestone ${m.order}: "${m.title}" (id: ${m.id}, status: ${m.status})`);
      console.log(`    unlocks:`, m.unlocks);
      console.log(`    why:`, m.why);
    }
  }
  const { getSkillGaps } = await import("../src/modules/learner/skill-gaps/services/skill-gaps.service.js");
  const gapsRes = await getSkillGaps(userId);
  console.log("\n=== GET SKILL GAPS RESULT ===");
  console.log("Overall health:", gapsRes.overallHealth);
  console.log("Critical gaps:", gapsRes.criticalGaps);
  console.log("Moderate gaps:", gapsRes.moderateGaps);
  console.log("Gaps:", gapsRes.gaps.map(g => ({ skill: g.skill, score: g.score, severity: g.severity })));

  const { getDashboardOverview } = await import("../src/modules/learner/dashboard/services/dashboard.service.js");
  const dashRes = await getDashboardOverview(userId);
  console.log("\n=== DASHBOARD OVERVIEW RESULT ===");
  console.log("Learning Debt:", dashRes.learningDebt);
  console.log("Next Action:", dashRes.nextAction);
  console.log("Skills (Trending):", dashRes.skills);
  console.log("Roadmap:", dashRes.roadmap);
}

main().catch(console.error).finally(() => process.exit(0));

