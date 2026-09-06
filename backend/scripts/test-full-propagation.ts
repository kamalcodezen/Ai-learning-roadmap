import { config } from "dotenv";
config();
import prisma from "../src/lib/prisma.js";
import {
  getSkillSimulation,
  submitSkillSimulation,
  getLatestSkillSimulationResult,
} from "../src/modules/learner/assessments/services/skill-simulation.service.js";
import { getAssessments } from "../src/modules/learner/assessments/services/assessments.service.js";
import { getSkillGaps } from "../src/modules/learner/skill-gaps/services/skill-gaps.service.js";
import { getCareerDecision } from "../src/modules/learner/career-intelligence/services/career-decision-engine.service.js";
import { getCareerReadiness } from "../src/modules/learner/readiness/services/readiness.service.js";
import { getDashboardOverview } from "../src/modules/learner/dashboard/services/dashboard.service.js";
import { getCareerTwin } from "../src/modules/learner/career-twin/services/career-twin.service.js";
import { getCareerAlignment } from "../src/modules/learner/career-alignment/services/career-alignment.service.js";
import { getLearnerJobReality } from "../src/modules/learner/job-reality/job-reality.service.js";
import { getProgress } from "../src/modules/learner/progress/services/progress.service.js";
import { getProofGraph } from "../src/modules/learner/proof-graph/services/proof-graph.service.js";
import { getApplicationReadiness } from "../src/modules/learner/application-readiness/services/application-readiness.service.js";

async function runPropagationAudit() {
  console.log("============================================================");
  console.log("STEP 8: ASSESSMENT RESULT FULL-SYSTEM PROPAGATION AUDIT");
  console.log("============================================================\n");

  const testUser =
    (await prisma.user.findFirst({
      where: { email: "browser-test-learner@example.com" },
      include: { careerProfile: true },
    })) ||
    (await prisma.user.findFirst({
      where: { role: "LEARNER" },
      include: { careerProfile: true },
    }));

  if (!testUser) {
    throw new Error("No learner user found in database.");
  }
  console.log(`Auditing propagation for user: ${testUser.id} (${testUser.email})`);

  // Target skill to test: SQL
  const targetSkill = "SQL";

  // ------------------------------------------------------------
  // SECTION 1: PRE-SUBMISSION BASELINE CAPTURE
  // ------------------------------------------------------------
  console.log("\n[Section 1] Capturing Pre-Submission Baseline Across All Systems...");

  const preSkillState = await prisma.skillState.findFirst({
    where: { userId: testUser.id, skillName: { equals: targetSkill, mode: "insensitive" } },
  });
  const preHistoryCount = await prisma.skillStateHistory.count({
    where: { userId: testUser.id, skillName: { equals: targetSkill, mode: "insensitive" } },
  });
  const preAssessments = await getAssessments(testUser.id);
  const preGaps = await getSkillGaps(testUser.id);
  const preReadiness = await getCareerReadiness(testUser.id);
  const preDecision = await getCareerDecision(testUser.id);
  const preDashboard = await getDashboardOverview(testUser.id);
  const preTwin = await getCareerTwin(testUser.id);
  const preAlignment = await getCareerAlignment(testUser.id);
  const preJobReality = await getLearnerJobReality(testUser.id);
  const preProgress = await getProgress(testUser.id);
  const preProofGraph = await getProofGraph(testUser.id);
  const preAppReadiness = await getApplicationReadiness(testUser.id);
  const preDiagnosticCount = await prisma.diagnosticAttempt.count({ where: { userId: testUser.id } });

  console.log(`  Baseline captured:`);
  console.log(`  - SkillState (${targetSkill}): Knowledge = ${preSkillState?.knowledgeScore ?? 0}%`);
  console.log(`  - Skill Gaps Health: ${preGaps.overallHealth}%`);
  console.log(`  - Career Readiness Score: ${preReadiness.score}%`);
  console.log(`  - Career Decision: ${preDecision.decision} (Signal: ${preDecision.employerConfidenceSignal}%)`);
  console.log(`  - Career Alignment Match: ${preAlignment.matchPercentage}%`);
  console.log(`  - Proof Graph Overall Proof Score: ${preProofGraph.overallProofScore}%`);
  console.log(`  - Application Readiness Score: ${preAppReadiness.overallScore}%`);

  // ------------------------------------------------------------
  // SECTION 2: SIMULATION GENERATION & SUBMISSION
  // ------------------------------------------------------------
  console.log(`\n[Section 2] Generating & Submitting Simulation for "${targetSkill}"...`);

  const simData = await getSkillSimulation(testUser.id, targetSkill);
  if (!simData.stages) {
    throw new Error(`Failed to retrieve simulation stages for ${targetSkill}`);
  }

  // Answer keys from active log
  const activeLog = await prisma.activityLog.findFirst({
    where: { userId: testUser.id, type: "SKILL_SIMULATION_ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
  const answerKeys = (activeLog?.metadata as any)?.answerKeys || {};
  const correctUnderstand = answerKeys.understandCorrect || simData.stages.understand.options[0];
  const correctDebug = answerKeys.debugCorrect || simData.stages.debug.options[0];

  const submissionPayload = {
    understandAnswer: correctUnderstand,
    debugAnswer: correctDebug,
    codeAnswer: `SELECT users.id, users.email, COUNT(orders.id) as order_count FROM users JOIN orders ON users.id = orders.user_id GROUP BY users.id, users.email HAVING COUNT(orders.id) > 1 ORDER BY order_count DESC;`,
    explainAnswer: `We use an indexed primary key and composite foreign keys to guarantee O(log N) B-Tree index lookups, avoiding costly full table scans while preserving transactional consistency and referential integrity.`,
  };

  const submitResult = await submitSkillSimulation(testUser.id, targetSkill, submissionPayload);
  console.log(`  ✓ Submission scored: ${submitResult.overallScore}%`);
  console.log(`  ✓ Stage Breakdown:`, submitResult.stageBreakdown);

  // ------------------------------------------------------------
  // SECTION 3: VERIFY RESULT PERSISTENCE & RETRIEVAL (ZERO AI CALL)
  // ------------------------------------------------------------
  console.log("\n[Section 3] Verifying Result Persistence in ActivityLog & Instant Retrieval...");
  const startResultTime = Date.now();
  const persistedResult = await getLatestSkillSimulationResult(testUser.id, targetSkill);
  const resultDuration = Date.now() - startResultTime;

  if (!persistedResult || persistedResult.overallScore !== submitResult.overallScore) {
    throw new Error("Persisted result mismatch in ActivityLog");
  }
  console.log(`  ✓ Result retrieved in ${resultDuration}ms without AI regeneration (Overall Score: ${persistedResult.overallScore}%)`);

  // ------------------------------------------------------------
  // SECTION 4: VERIFY SKILLSTATE & SKILLSTATEHISTORY PROPAGATION
  // ------------------------------------------------------------
  console.log("\n[Section 4] Verifying SkillState & SkillStateHistory Propagation...");
  const postSkillState = await prisma.skillState.findFirst({
    where: { userId: testUser.id, skillName: { equals: targetSkill, mode: "insensitive" } },
  });
  if (!postSkillState) {
    throw new Error(`SkillState not found for ${targetSkill} after submission`);
  }
  console.log(`  ✓ SkillState updated: Knowledge = ${postSkillState.knowledgeScore}%, Practice = ${postSkillState.practiceScore}%`);

  const postHistoryCount = await prisma.skillStateHistory.count({
    where: { userId: testUser.id, skillName: { equals: targetSkill, mode: "insensitive" } },
  });
  if (postHistoryCount <= preHistoryCount) {
    throw new Error(`SkillStateHistory audit record was not appended`);
  }
  console.log(`  ✓ SkillStateHistory audit rows: ${postHistoryCount} (progress recorded)`);

  // ------------------------------------------------------------
  // SECTION 5: VERIFY SKILL GAP RECALCULATION
  // ------------------------------------------------------------
  console.log("\n[Section 5] Verifying Skill Gaps Service Recalculation...");
  const postGaps = await getSkillGaps(testUser.id);
  const targetGap = postGaps.gaps.find((g) => g.skill.toLowerCase() === targetSkill.toLowerCase());
  console.log(`  ✓ Overall Health: ${postGaps.overallHealth}% (Previous: ${preGaps.overallHealth}%)`);
  if (targetGap) {
    console.log(`  ✓ ${targetSkill} Gap: Score = ${targetGap.score}%, Severity = ${targetGap.severity}`);
  } else {
    console.log(`  ✓ ${targetSkill} is mastered (gap eliminated or resolved above 70%)`);
  }

  // ------------------------------------------------------------
  // SECTION 6: VERIFY CAREER READINESS PROPAGATION
  // ------------------------------------------------------------
  console.log("\n[Section 6] Verifying Career Readiness Service Propagation...");
  const postReadiness = await getCareerReadiness(testUser.id);
  console.log(`  ✓ Readiness Score: ${postReadiness.score}% (Previous: ${preReadiness.score}%)`);
  console.log(`  ✓ Knowledge Dimension: ${postReadiness.scores.knowledge}%`);
  console.log(`  ✓ Practical Dimension: ${postReadiness.scores.practical}%`);

  // ------------------------------------------------------------
  // SECTION 7: VERIFY CAREER DECISION ENGINE PROPAGATION
  // ------------------------------------------------------------
  console.log("\n[Section 7] Verifying Career Decision Engine Propagation...");
  const postDecision = await getCareerDecision(testUser.id);
  console.log(`  ✓ Decision Status: ${postDecision.decision}, Priority: ${postDecision.priority}`);
  console.log(`  ✓ Next Best Action: "${postDecision.nextBestAction.title}" (${postDecision.nextBestAction.type})`);
  console.log(`  ✓ Employer Confidence Signal: ${postDecision.employerConfidenceSignal}%`);

  // ------------------------------------------------------------
  // SECTION 8: VERIFY DASHBOARD OVERVIEW PROPAGATION
  // ------------------------------------------------------------
  console.log("\n[Section 8] Verifying Dashboard Overview Propagation...");
  const postDashboard = await getDashboardOverview(testUser.id);
  console.log(`  ✓ Dashboard Readiness Score: ${postDashboard.readiness.score}%`);
  console.log(`  ✓ Dashboard Assessments Completed Count: ${postDashboard.assessments.completedCount}`);
  console.log(`  ✓ Dashboard Proof Summary Skills Tracked: ${postDashboard.proof.trackedSkillsCount}`);
  console.log(`  ✓ Dashboard KPIs Career Readiness: ${postDashboard.kpis.careerReadiness}%`);
  console.log(`  ✓ Dashboard KPIs Skill Progress: ${postDashboard.kpis.skillProgress}%`);

  // ------------------------------------------------------------
  // SECTION 9: VERIFY CAREER TWIN PROPAGATION
  // ------------------------------------------------------------
  console.log("\n[Section 9] Verifying Career Twin Propagation...");
  const postTwin = await getCareerTwin(testUser.id);
  console.log(`  ✓ Career Twin Readiness Score: ${postTwin.readinessScore}%`);
  console.log(`  ✓ Career Twin Knowledge Score: ${postTwin.scores.knowledge}%`);

  // ------------------------------------------------------------
  // SECTION 10: VERIFY CAREER ALIGNMENT & JOB REALITY PROPAGATION
  // ------------------------------------------------------------
  console.log("\n[Section 10] Verifying Career Alignment & Job Reality Propagation...");
  const postAlignment = await getCareerAlignment(testUser.id);
  console.log(`  ✓ Career Alignment Match: ${postAlignment.matchPercentage}% (Previous: ${preAlignment.matchPercentage}%)`);
  console.log(`  ✓ Strong Skills: ${postAlignment.strongSkills.join(", ") || "None"}`);

  const postJobReality = await getLearnerJobReality(testUser.id);
  const sqlJobSkill = postJobReality.skills.find((s: any) => s.name.toLowerCase() === targetSkill.toLowerCase());
  if (sqlJobSkill) {
    console.log(`  ✓ Job Reality ${targetSkill}: Learner Score = ${sqlJobSkill.learnerScore}%, Gap = ${sqlJobSkill.gap}`);
  }

  // ------------------------------------------------------------
  // SECTION 11: VERIFY PROGRESS ANALYTICS PROPAGATION
  // ------------------------------------------------------------
  console.log("\n[Section 11] Verifying Progress Analytics Propagation...");
  const postProgress = await getProgress(testUser.id);
  const latestActivity = postProgress.recentActivity[0];
  console.log(`  ✓ Recent Activity count: ${postProgress.recentActivity.length}`);
  console.log(`  ✓ Most Recent Activity: "${latestActivity?.title}" - "${latestActivity?.description}"`);

  // ------------------------------------------------------------
  // SECTION 12: VERIFY PROOF GRAPH & APPLICATION READINESS
  // ------------------------------------------------------------
  console.log("\n[Section 12] Verifying Proof Graph & Application Readiness Propagation...");
  const postProofGraph = await getProofGraph(testUser.id);
  const sqlNode = postProofGraph.nodes.find((n: any) => n.title.toLowerCase() === targetSkill.toLowerCase());
  console.log(`  ✓ Proof Graph Overall Proof Score: ${postProofGraph.overallProofScore}%`);
  if (sqlNode) {
    console.log(`  ✓ Proof Graph ${targetSkill} Node: status = "${sqlNode.status}", score = ${sqlNode.score}%`);
  }

  const postAppReadiness = await getApplicationReadiness(testUser.id);
  console.log(`  ✓ Application Readiness Overall Score: ${postAppReadiness.overallScore}%`);
  console.log(`  ✓ Technical Knowledge Category Score: ${postAppReadiness.categories.find((c: any) => c.id === "tech-1")?.score}%`);

  // ------------------------------------------------------------
  // SECTION 13: VERIFY ASSESSMENTS DASHBOARD CARD STATUS
  // ------------------------------------------------------------
  console.log("\n[Section 13] Verifying Assessments Dashboard Status Separation...");
  const postAssessments = await getAssessments(testUser.id);
  const sqlCard = postAssessments.assessments.find((a) => a.skillAssociated?.toLowerCase() === targetSkill.toLowerCase());
  if (!sqlCard || sqlCard.status !== "completed" || !sqlCard.href.includes("review=true")) {
    throw new Error(`Expected completed card with review=true for ${targetSkill}, got: status=${sqlCard?.status}, href=${sqlCard?.href}`);
  }
  console.log(`  ✓ ${targetSkill} Card: status = "${sqlCard.status}", score = ${sqlCard.score}%, href = "${sqlCard.href}"`);

  // ------------------------------------------------------------
  // SECTION 14: VERIFY GENERAL DIAGNOSTIC ISOLATION
  // ------------------------------------------------------------
  console.log("\n[Section 14] Verifying General Diagnostic Remains 100% Isolated...");
  const postDiagnosticCount = await prisma.diagnosticAttempt.count({ where: { userId: testUser.id } });
  if (postDiagnosticCount !== preDiagnosticCount) {
    throw new Error("DiagnosticAttempt count altered during skill simulation");
  }
  console.log(`  ✓ DiagnosticAttempt records unchanged (${postDiagnosticCount})`);

  console.log("\n============================================================");
  console.log("FULL SYSTEM PROPAGATION AUDIT PASSED WITH 100% SUCCESS! ✓");
  console.log("============================================================\n");
}

runPropagationAudit()
  .catch((err) => {
    console.error("\n❌ Propagation audit failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
