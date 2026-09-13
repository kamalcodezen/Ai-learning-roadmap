import { config } from "dotenv";
config();

import assert from "node:assert";
import prisma from "../src/lib/prisma.js";
import { generateDiagnosticQuestions, DiagnosticAiResponseSchema } from "../src/modules/learner/diagnostic/services/diagnostic-ai.service.js";
import { getDiagnosticQuestions } from "../src/modules/learner/diagnostic/services/diagnostic-question.service.js";
import { submitDiagnosticAnswer } from "../src/modules/learner/diagnostic/services/diagnostic-answer.service.js";
import { completeDiagnosticAttempt } from "../src/modules/learner/diagnostic/services/diagnostic-attempt.service.js";
import { getDiagnosticResult } from "../src/modules/learner/diagnostic/services/diagnostic-result.service.js";
import { getCareerReadiness } from "../src/modules/learner/readiness/services/readiness.service.js";
import { getDashboardOverview } from "../src/modules/learner/dashboard/services/dashboard.service.js";

async function runRegressionSuite() {
  console.log("==================================================");
  console.log("DIAGNOSTIC FAST GENERATION & REGRESSION TEST SUITE");
  console.log("==================================================\n");

  // Create or retrieve a test user
  const testEmail = `diag-test-${Date.now()}@example.com`;
  const testUser = await prisma.user.create({
    data: {
      id: `diag-user-${Date.now()}`,
      name: "Diagnostic Test Candidate",
      email: testEmail,
      emailVerified: true,
      role: "LEARNER",
    },
  });

  console.log(`[Setup] Created test user: ${testUser.id}`);

  try {
    // ----------------------------------------------------
    // TEST 1: Zod Schema Rejection of Malformed AI Output
    // ----------------------------------------------------
    console.log("\n--- TEST 1: Zod Validation & Schema Rejection ---");
    const malformedOutputs = [
      { technicalQuestions: [] }, // missing questions
      { technicalQuestions: Array(4).fill({}) }, // fewer than 5
      {
        technicalQuestions: Array(5).fill({
          question: "Valid question with sufficient length?",
          description: "",
          category: "Backend",
          skill: "Node.js",
          options: ["A", "B", "C", "D"],
          correctAnswer: "E", // Not in options
          difficulty: "intermediate",
        }),
        communicationQuestion: {
          question: "Explain architecture clearly",
          skill: "Technical Communication",
        },
      },
    ];

    for (const bad of malformedOutputs) {
      const result = DiagnosticAiResponseSchema.safeParse(bad);
      assert.strictEqual(result.success, false, "Zod must reject malformed AI response");
    }
    console.log("✓ Zod schema strictly rejects incomplete questions, bad counts, and invalid correctAnswers");

    // ----------------------------------------------------
    // TEST 2: Dynamic Real Data (Non-Default Target Role)
    // ----------------------------------------------------
    console.log("\n--- TEST 2: Real Data Test (DevOps & Cloud Engineer) ---");
    const devopsProfile = await prisma.careerProfile.create({
      data: {
        userId: testUser.id,
        targetRole: "DevOps Engineer",
        targetRoleName: "DevOps & Cloud Infrastructure Engineer",
        experienceLevel: "BEGINNER",
        weeklyAvailableHours: 15,
        onboardingCompleted: true,
      },
    });

    console.log("[Context] Generating diagnostic for target role: DevOps Engineer...");
    const devopsQuestions = await getDiagnosticQuestions({ userId: testUser.id });

    assert.strictEqual(devopsQuestions.length, 6, "Must return exactly 6 questions");
    const devopsMcqs = devopsQuestions.filter((q) => Array.isArray(q.options) && q.options.length === 4);
    const devopsComm = devopsQuestions.filter((q) => Array.isArray(q.options) && q.options.length === 0);

    assert.strictEqual(devopsMcqs.length, 5, "Must have exactly 5 MCQs");
    assert.strictEqual(devopsComm.length, 1, "Must have exactly 1 communication question");

    const activeAttemptId = devopsQuestions[0]?.attemptId;
    assert.ok(activeAttemptId, "Questions must have active attemptId attached");

    console.log(`✓ Generated 6 personalized DevOps questions with attemptId: ${activeAttemptId}`);
    console.log(`  Sample Q1: "${devopsQuestions[0]?.question.slice(0, 60)}..."`);
    console.log(`  Sample Q6 (Comm): "${devopsQuestions[5]?.question.slice(0, 60)}..."`);

    // ----------------------------------------------------
    // TEST 3: Persistence & 0-AI Reuse on Reload/Refresh
    // ----------------------------------------------------
    console.log("\n--- TEST 3: 0-AI Call Persistence on Refresh ---");
    const reloadedQuestions = await getDiagnosticQuestions({ userId: testUser.id });

    assert.strictEqual(reloadedQuestions.length, 6, "Reload must return 6 questions");
    assert.strictEqual(
      reloadedQuestions[0]?.attemptId,
      activeAttemptId,
      "Reload must return existing attempt without generating new AI questions"
    );
    assert.strictEqual(
      reloadedQuestions[0]?.question,
      devopsQuestions[0]?.question,
      "Persisted question text must match identically"
    );
    console.log("✓ Refresh returned persisted questions from DB with 0 additional AI calls");

    // ----------------------------------------------------
    // TEST 4: Concurrency Mutex Protection
    // ----------------------------------------------------
    console.log("\n--- TEST 4: Concurrency Mutex ---");
    const concurrentResults = await Promise.all([
      getDiagnosticQuestions({ userId: testUser.id }),
      getDiagnosticQuestions({ userId: testUser.id }),
      getDiagnosticQuestions({ userId: testUser.id }),
    ]);

    assert.strictEqual(concurrentResults[0]?.[0]?.attemptId, activeAttemptId);
    assert.strictEqual(concurrentResults[1]?.[0]?.attemptId, activeAttemptId);
    assert.strictEqual(concurrentResults[2]?.[0]?.attemptId, activeAttemptId);
    console.log("✓ Simultaneous calls resolved to the exact same persisted attempt without duplicate generation");

    // ----------------------------------------------------
    // TEST 5: Answer Submissions & Communication Evaluation
    // ----------------------------------------------------
    console.log("\n--- TEST 5: Submitting Answers & Communication Evaluation ---");
    // Fetch raw questions to obtain correct answers for MCQ testing
    const rawQuestions = await prisma.diagnosticQuestion.findMany({
      where: { attemptId: activeAttemptId },
      orderBy: { order: "asc" },
    });

    // Answer Q1-Q4 correctly, Q5 incorrectly (4/5 = 80%)
    for (let i = 0; i < 5; i++) {
      const q = rawQuestions[i]!;
      const selected = i < 4 ? q.correctAnswer : (q.options as string[]).find((o) => o !== q.correctAnswer) || "Wrong";
      await submitDiagnosticAnswer(activeAttemptId, testUser.id, {
        questionId: q.id,
        selectedAnswer: selected,
      });
    }

    // Submit Q6 (Communication question)
    const commQ = rawQuestions[5]!;
    console.log("[Communication] Submitting candidate technical explanation for Q6...");
    const commAnswerRes = await submitDiagnosticAnswer(activeAttemptId, testUser.id, {
      questionId: commQ.id,
      selectedAnswer: "In designing a CI/CD pipeline, containerization using Docker provides reproducible build artifacts across staging and production. We deploy containers to Kubernetes via Helm charts with canary rollouts, ensuring automated rollbacks if health probes detect increased error latency.",
    });

    assert.ok(commAnswerRes.evaluation, "Q6 must receive communication evaluation");
    console.log(`✓ Q6 evaluated: score ${commAnswerRes.evaluation.score}%, clarity ${commAnswerRes.evaluation.clarity}%, feedback: "${commAnswerRes.evaluation.feedback?.slice(0, 50)}..."`);

    // ----------------------------------------------------
    // TEST 6: Completion, Scoring & SkillState Integration
    // ----------------------------------------------------
    console.log("\n--- TEST 6: Completion, Scoring & SkillState ---");
    const completeResult = await completeDiagnosticAttempt(activeAttemptId, testUser.id);

    assert.strictEqual(completeResult.overallScore, 80, "Technical MCQ score must be 80% (4/5 correct, excluding Q6)");
    assert.strictEqual(completeResult.correctAnswers, 4, "Must record 4 correct answers");
    assert.strictEqual(completeResult.mcqCount, 5, "Must count exactly 5 MCQs");
    assert.strictEqual(completeResult.communication.isAvailable, true, "Communication details must be available");

    // Check SkillState in DB
    const skillStates = await prisma.skillState.findMany({ where: { userId: testUser.id } });
    assert.ok(skillStates.length > 0, "SkillState must be created from diagnostic results");
    console.log(`✓ SkillState updated: ${skillStates.map(s => `${s.skillName} (${s.knowledgeScore}%)`).join(", ")}`);

    // ----------------------------------------------------
    // TEST 7: Result Retrieval & Downstream Integrations
    // ----------------------------------------------------
    console.log("\n--- TEST 7: Downstream Integrations (Readiness & Dashboard) ---");
    const fetchedResult = await getDiagnosticResult(activeAttemptId, testUser.id);
    assert.strictEqual(fetchedResult.overallScore, 80);
    assert.ok(fetchedResult.recommendations.length > 0, "Personalized recommendations must exist");

    // Readiness
    const readiness = await getCareerReadiness(testUser.id);
    assert.ok(readiness.score > 0, "Readiness score must reflect completed diagnostic");
    console.log(`✓ Readiness updated: Overall ${readiness.score}%, Communication: ${readiness.scores.communication}`);

    // Dashboard
    const dashboard = await getDashboardOverview(testUser.id);
    assert.strictEqual(dashboard.assessments.completedCount, 1, "Dashboard must reflect 1 completed assessment");
    console.log(`✓ Dashboard verified: completedCount = ${dashboard.assessments.completedCount}, targetRole = ${dashboard.career.targetRole}`);

    console.log("\n==================================================");
    console.log("🎉 ALL REGRESSION & PERFORMANCE TESTS PASSED!");
    console.log("==================================================");
  } finally {
    // Cleanup test user and associated cascade records
    await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    console.log(`[Cleanup] Deleted test user: ${testUser.id}`);
  }
}

runRegressionSuite().catch((err) => {
  console.error("\n❌ REGRESSION TEST FAILED:", err);
  process.exit(1);
});
