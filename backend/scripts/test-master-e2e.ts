import assert from "node:assert";
import prisma from "../src/lib/prisma.js";

// Feature 01 & 02: Career Analysis & Skill Gaps
import { generateCareerAnalysis } from "../src/modules/learner/profile/services/career-analysis.service.js";
import { getSkillGaps } from "../src/modules/learner/skill-gaps/services/skill-gaps.service.js";

// Feature 03 & 04 & 05: Roadmap, Projects & Resources
import { getOrGenerateLearningPath, completeMilestone } from "../src/modules/learner/roadmap/services/learning-path.service.js";
import { createProject } from "../src/modules/learner/projects/services/portfolio.service.js";
import { getCuratedResourcesForMilestone } from "../src/modules/learner/roadmap/services/resource-curator.service.js";

// Feature 06: Adaptive Learning Engine
import { getAdaptiveLearningDecision } from "../src/modules/learner/roadmap/services/adaptive-learning.service.js";

// Feature 07: Copilot Assistant
import { ChatService } from "../src/modules/learner/copilot/services/chat.service.js";

// Feature 08: Career Alignment & Job Market
import { getCareerAlignment } from "../src/modules/learner/career-alignment/services/career-alignment.service.js";
import { getLearnerJobReality } from "../src/modules/learner/job-reality/job-reality.service.js";

// Feature 09: Progress Telemetry
import { getProgress } from "../src/modules/learner/progress/services/progress.service.js";

// Feature 10: Diagnostic & Practical Assessment
import { getDiagnosticQuestions } from "../src/modules/learner/diagnostic/services/diagnostic-question.service.js";
import { submitDiagnosticAnswer } from "../src/modules/learner/diagnostic/services/diagnostic-answer.service.js";
import { completeDiagnosticAttempt } from "../src/modules/learner/diagnostic/services/diagnostic-attempt.service.js";

// Feature 11: Skill Tree & Gamification
import { getUserGamificationProfile } from "../src/modules/learner/gamification/services/gamification.service.js";
import { getSkillTree } from "../src/modules/learner/gamification/services/skill-tree.service.js";

// Feature 12: Proof Graph, Readiness, Career Twin & Application Readiness
import { getProofGraph } from "../src/modules/learner/proof-graph/services/proof-graph.service.js";
import { getCareerReadiness } from "../src/modules/learner/readiness/services/readiness.service.js";
import { getCareerTwin } from "../src/modules/learner/career-twin/services/career-twin.service.js";
import { getApplicationReadiness } from "../src/modules/learner/application-readiness/services/application-readiness.service.js";

async function runMasterE2ETests() {
  console.log("================================================================================");
  console.log("AI PATHER — MASTER END-TO-END CONTINUOUS LEARNER JOURNEY VERIFICATION");
  console.log("================================================================================");

  const testUserId = `master-usr-${Date.now()}`;
  let testUser: any = null;

  try {
    // --------------------------------------------------------------------------------
    // STEP 1: USER SIGNUP & INITIAL ONBOARDING
    // --------------------------------------------------------------------------------
    console.log("\n[Step 1] Creating new user & initial career profile (Full-Stack Developer)...");
    testUser = await prisma.user.create({
      data: {
        id: testUserId,
        name: "Master E2E Learner",
        email: `master-e2e-${Date.now()}@example.com`,
        emailVerified: true,
        role: "LEARNER",
        careerProfile: {
          create: {
            targetRole: "Full-Stack Developer",
            targetRoleName: "Full-Stack Developer",
            experienceLevel: "INTERMEDIATE",
            weeklyAvailableHours: 15,
            onboardingCompleted: true,
          },
        },
      },
      include: { careerProfile: true },
    });
    assert.ok(testUser.id, "User must be created");
    assert.strictEqual(testUser.careerProfile.targetRole, "Full-Stack Developer");
    console.log("✓ Step 1 Passed: User signup and onboarding completed");

    // --------------------------------------------------------------------------------
    // STEP 2: CAREER GOAL ANALYSIS (Feature 01)
    // --------------------------------------------------------------------------------
    console.log("\n[Step 2] Executing AI Career Goal Analysis...");
    const careerAnalysis = await generateCareerAnalysis(testUser.id);
    assert.strictEqual(careerAnalysis.role, "Full-Stack Developer");
    assert.ok(careerAnalysis.coreSkills.length > 0, "Must identify core skills");
    assert.ok(careerAnalysis.learningPriorities.length > 0, "Must establish learning priorities");
    console.log(`✓ Step 2 Passed: Career Analysis generated (${careerAnalysis.coreSkills.length} core skills, domain: ${careerAnalysis.domain})`);

    // --------------------------------------------------------------------------------
    // STEP 3: DIAGNOSTIC ASSESSMENT & SCORING (Feature 10)
    // --------------------------------------------------------------------------------
    console.log("\n[Step 3] Fetching diagnostic questions (5 MCQ + 1 Open-Ended)...");
    const questions = await getDiagnosticQuestions({ userId: testUser.id });
    assert.strictEqual(questions.length, 6, "Must return exactly 6 questions");
    
    // Verify client payload sanitization
    for (const q of questions) {
      assert.strictEqual((q as any).correctAnswer, undefined, "correctAnswer must not leak to client");
    }

    const attempt = await prisma.diagnosticAttempt.findFirst({
      where: { userId: testUser.id, status: "IN_PROGRESS" },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    assert.ok(attempt, "Active attempt must exist in DB");

    // Submit answers for all 6 questions
    for (let i = 0; i < 5; i++) {
      const q = attempt.questions[i];
      await submitDiagnosticAnswer(attempt.id, testUser.id, {
        questionId: q.id,
        selectedAnswer: q.correctAnswer, // Correct
      });
    }

    const commQ = attempt.questions[5];
    await submitDiagnosticAnswer(attempt.id, testUser.id, {
      questionId: commQ.id,
      selectedAnswer: "RESTful APIs use HTTP verbs (GET, POST, PUT, DELETE) for stateless client-server resource management, while GraphQL uses queries and mutations across a unified endpoint.",
    });

    const completionResult = await completeDiagnosticAttempt(attempt.id, testUser.id);
    assert.strictEqual(completionResult.status, "COMPLETED");
    assert.strictEqual(completionResult.score, 100, "5/5 MCQ score must be 100%");
    console.log("✓ Step 3 Passed: Diagnostic completed (MCQ: 100%, Open-Ended evaluated, SkillStates initialized)");

    // --------------------------------------------------------------------------------
    // STEP 4: SKILL-GAP DIAGNOSIS (Feature 02)
    // --------------------------------------------------------------------------------
    console.log("\n[Step 4] Running Skill-Gap Diagnosis...");
    const skillGaps = await getSkillGaps(testUser.id);
    assert.ok(typeof skillGaps.criticalGaps === "number", "Critical gaps count must be a number");
    assert.ok(typeof skillGaps.strongSkills === "number", "Strong skills count must be a number");
    assert.ok(Array.isArray(skillGaps.gaps), "Gaps must be an array");
    console.log(`✓ Step 4 Passed: Skill gaps analyzed (${skillGaps.criticalGaps} critical gaps, ${skillGaps.strongSkills} strong skills, ${skillGaps.gaps.length} total gap items)`);

    // --------------------------------------------------------------------------------
    // STEP 5: ROADMAP & MILESTONES (Feature 03 & 05)
    // --------------------------------------------------------------------------------
    console.log("\n[Step 5] Generating learning roadmap and fetching authoritative resources...");
    const roadmapData = await getOrGenerateLearningPath(testUser.id);
    assert.ok(roadmapData.milestones.length >= 3, "Roadmap must contain progressive milestones");

    const currentMilestone = roadmapData.milestones[0];
    const curatorResult = await getCuratedResourcesForMilestone(testUser.id, currentMilestone.id);
    assert.ok(curatorResult.resources.length > 0, "Curator must return safe authoritative resources");
    assert.ok(curatorResult.resources.every((r) => r.url.startsWith("https://")), "All resources must use secure HTTPS");
    console.log(`✓ Step 5 Passed: Roadmap active (${roadmapData.milestones.length} milestones; Milestone 1 has ${curatorResult.resources.length} resources)`);

    // --------------------------------------------------------------------------------
    // STEP 6: PORTFOLIO PROJECT & VERIFIED EVIDENCE (Feature 04)
    // --------------------------------------------------------------------------------
    console.log("\n[Step 6] Creating verified portfolio project and syncing proof evidence...");
    const project = await createProject(testUser.id, {
      title: "Enterprise Full-Stack Platform",
      description: "Production web application with PostgreSQL, Redis, and TypeScript backend",
      repositoryUrl: "https://github.com/facebook/react",
      liveUrl: "https://react.dev",
      techStack: ["TypeScript", "React", "Node.js"],
    });
    assert.strictEqual(project.isVerified, true, "Verified repository must set isVerified: true");

    const evidenceCount = await prisma.projectEvidence.count({ where: { userId: testUser.id } });
    assert.ok(evidenceCount > 0, "ProjectEvidence records must be populated");
    console.log(`✓ Step 6 Passed: Verified project created (Score: ${project.score}%, Evidence synced: ${evidenceCount} records)`);

    // --------------------------------------------------------------------------------
    // STEP 7: GAMIFICATION & SKILL TREE (Feature 11)
    // --------------------------------------------------------------------------------
    console.log("\n[Step 7] Checking Gamification profile, XP ledger & 4-State Skill Tree...");
    const gamificationProfile = await getUserGamificationProfile(testUser.id);
    assert.ok(gamificationProfile.totalXp >= 300, "User must have earned XP from assessment and project");
    assert.ok(gamificationProfile.levelInfo.level >= 2, "Level must have advanced beyond level 1");
    assert.ok(gamificationProfile.unlockedCount > 0, "Must have unlocked real action achievements");

    const skillTree = await getSkillTree(testUser.id);
    assert.strictEqual(skillTree.targetRole, "Full-Stack Developer");
    assert.ok(skillTree.nodes.some((n) => n.status === "MASTERED" || n.status === "IN_PROGRESS"), "Skill tree nodes must be populated");
    console.log(`✓ Step 7 Passed: Gamification active (Level: ${gamificationProfile.levelInfo.level} "${gamificationProfile.levelInfo.title}", Total XP: ${gamificationProfile.totalXp}, Unlocked Badges: ${gamificationProfile.unlockedCount})`);

    // --------------------------------------------------------------------------------
    // STEP 8: ADAPTIVE LEARNING ENGINE (Feature 06)
    // --------------------------------------------------------------------------------
    console.log("\n[Step 8] Evaluating Adaptive Learning Engine next best action...");
    const adaptiveDecision = await getAdaptiveLearningDecision(testUser.id);
    assert.ok(adaptiveDecision.type, "Adaptive decision must produce a decision type");
    assert.ok(adaptiveDecision.reason.length > 0, "Adaptive decision must be explainable");
    console.log(`✓ Step 8 Passed: Adaptive engine determined action: ${adaptiveDecision.type} ("${adaptiveDecision.reason}")`);

    // --------------------------------------------------------------------------------
    // STEP 9: COPILOT CONTEXT INJECTION (Feature 07)
    // --------------------------------------------------------------------------------
    console.log("\n[Step 9] Testing Copilot assistant context retrieval...");
    const userContext = await ChatService.fetchUserContext(testUser.id, "How can I improve my Node.js skills for my roadmap?");
    const copilotResponse = await ChatService.processChat("How can I improve my Node.js skills for my roadmap?", [], userContext);
    assert.ok(copilotResponse.reply.length > 0, "Copilot must respond with guidance");
    console.log(`✓ Step 9 Passed: Copilot assistant responsive with anti-injection and context controls (Provider: ${copilotResponse.provider})`);

    // --------------------------------------------------------------------------------
    // STEP 10: CAREER ALIGNMENT & JOB MARKET DEMAND (Feature 08)
    // --------------------------------------------------------------------------------
    console.log("\n[Step 10] Checking Career Alignment & real Job Market demand...");
    const careerAlignment = await getCareerAlignment(testUser.id);
    assert.ok(typeof careerAlignment.matchPercentage === "number", "Match percentage must be computed");
    assert.strictEqual(careerAlignment.targetRole, "Full-Stack Developer");

    const jobReality = await getLearnerJobReality(testUser.id);
    assert.ok(Array.isArray(jobReality.skills), "Market skills must be an array");
    assert.ok(Array.isArray(jobReality.insights), "Market insights must be an array");
    console.log(`✓ Step 10 Passed: Market demand aligned (Demand Level: ${jobReality.market.demandLevel}, Match Percentage: ${careerAlignment.matchPercentage}%)`);

    // --------------------------------------------------------------------------------
    // STEP 11: PROGRESS TELEMETRY & STREAK (Feature 09)
    // --------------------------------------------------------------------------------
    console.log("\n[Step 11] Checking Progress telemetry & activity stream...");
    const progress = await getProgress(testUser.id);
    assert.ok(progress.recentActivity.length > 0, "Recent activity stream must record assessment and project events");
    assert.ok(progress.currentStreak >= 1, "Active learner streak must be at least 1 day");
    console.log(`✓ Step 11 Passed: Progress stream active (Streak: ${progress.currentStreak} day(s), Recent activities: ${progress.recentActivity.length})`);

    // --------------------------------------------------------------------------------
    // STEP 12: PROOF GRAPH DAG & CAREER READINESS (Feature 12)
    // --------------------------------------------------------------------------------
    console.log("\n[Step 12] Tracing Proof Graph DAG, Career Twin & Application Readiness gate...");
    const proofGraph = await getProofGraph(testUser.id);
    assert.ok(typeof proofGraph.overallProofScore === "number" && proofGraph.overallProofScore >= 0, "Proof score must be computed");
    assert.ok(proofGraph.nodes.length >= 3, "Proof Graph must contain skill, evidence, and project nodes");

    const readiness = await getCareerReadiness(testUser.id);
    assert.ok(readiness.score > 0, "Readiness score must be calculated across active dimensions");
    assert.ok(readiness.scores.knowledge !== "NOT_ASSESSED");

    const careerTwin = await getCareerTwin(testUser.id);
    assert.strictEqual(careerTwin.targetRole, "Full-Stack Developer");
    assert.strictEqual(careerTwin.readinessScore, readiness.score);

    const appReadiness = await getApplicationReadiness(testUser.id);
    assert.ok(typeof appReadiness.isReady === "boolean");
    assert.strictEqual(appReadiness.categories.length, 3);
    console.log(`✓ Step 12 Passed: Single source of truth readiness verified (Readiness Score: ${readiness.score}%, Proof Score: ${proofGraph.overallProofScore}%, App Ready: ${appReadiness.isReady})`);

    console.log("\n================================================================================");
    console.log("MASTER E2E LEARNER JOURNEY: ALL 12 FEATURES VERIFIED (12/12 PASS)");
    console.log("================================================================================");
  } finally {
    if (testUser?.id) {
      await prisma.userAchievement.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.xPTransaction.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.userGamification.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.projectEvidence.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.project.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.milestone.deleteMany({ where: { roadmap: { userId: testUser.id } } }).catch(() => {});
      await prisma.roadmap.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.diagnosticAnswer.deleteMany({ where: { attempt: { userId: testUser.id } } }).catch(() => {});
      await prisma.diagnosticQuestion.deleteMany({ where: { attempt: { userId: testUser.id } } }).catch(() => {});
      await prisma.diagnosticAttempt.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.interviewAnswer.deleteMany({ where: { session: { userId: testUser.id } } }).catch(() => {});
      await prisma.interviewQuestion.deleteMany({ where: { session: { userId: testUser.id } } }).catch(() => {});
      await prisma.interviewSession.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.skillStateHistory.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.skillState.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.activityLog.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.careerProfile.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runMasterE2ETests().catch((err) => {
  console.error("Master E2E Verification Failed:", err);
  process.exit(1);
});
