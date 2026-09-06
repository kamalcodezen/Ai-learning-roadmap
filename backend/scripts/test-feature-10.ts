import assert from "node:assert";
import prisma from "../src/lib/prisma.js";
import { getDiagnosticQuestions } from "../src/modules/learner/diagnostic/services/diagnostic-question.service.js";
import { submitDiagnosticAnswer } from "../src/modules/learner/diagnostic/services/diagnostic-answer.service.js";
import { completeDiagnosticAttempt } from "../src/modules/learner/diagnostic/services/diagnostic-attempt.service.js";
import {
  startInterviewSession,
  submitInterviewAnswer,
  completeInterviewSession,
} from "../src/modules/learner/interview/services/interview.service.js";

async function runFeature10Tests() {
  console.log("============================================================");
  console.log("FEATURE 10 — PRACTICAL ASSESSMENT SYSTEM VERIFICATION");
  console.log("============================================================");

  const testUserAId = `f10-usrA-${Date.now()}`;
  const testUserBId = `f10-usrB-${Date.now()}`;
  const testUserCId = `f10-usrC-${Date.now()}`;

  try {
    // ------------------------------------------------------------
    // SEED TEST USERS & PROFILES
    // ------------------------------------------------------------
    const userA = await prisma.user.create({
      data: {
        id: testUserAId,
        name: "Assessment Tester A",
        email: `f10-a-${Date.now()}@example.com`,
        emailVerified: true,
        role: "LEARNER",
        careerProfile: {
          create: {
            targetRole: "Full-Stack Developer",
            targetRoleName: "Full-Stack Developer",
            experienceLevel: "INTERMEDIATE",
            weeklyAvailableHours: 15,
          },
        },
      },
      include: { careerProfile: true },
    });

    const userB = await prisma.user.create({
      data: {
        id: testUserBId,
        name: "Assessment Tester B (Cross-User / IDOR)",
        email: `f10-b-${Date.now()}@example.com`,
        emailVerified: true,
        role: "LEARNER",
        careerProfile: {
          create: {
            targetRole: "Frontend Developer",
            targetRoleName: "Frontend Developer",
            experienceLevel: "BEGINNER",
            weeklyAvailableHours: 10,
          },
        },
      },
    });

    const userC = await prisma.user.create({
      data: {
        id: testUserCId,
        name: "Assessment Tester C (Incomplete Attempt)",
        email: `f10-c-${Date.now()}@example.com`,
        emailVerified: true,
        role: "LEARNER",
        careerProfile: {
          create: {
            targetRole: "Backend Developer",
            targetRoleName: "Backend Developer",
            experienceLevel: "INTERMEDIATE",
            weeklyAvailableHours: 10,
          },
        },
      },
    });

    // ------------------------------------------------------------
    // TEST 1: Diagnostic Question Retrieval & Answer Leak Prevention
    // ------------------------------------------------------------
    console.log("\n[Test 1] Testing diagnostic question generation & client payload sanitization...");
    const questions = await getDiagnosticQuestions({ userId: userA.id });
    assert.strictEqual(questions.length, 6, "Must return exactly 6 questions (5 MCQ + 1 Open Communication)");

    const mcqQuestions = questions.filter((q) => q.order <= 5);
    const commQuestion = questions.find((q) => q.order === 6);

    assert.strictEqual(mcqQuestions.length, 5, "Must have exactly 5 MCQ questions");
    assert.ok(commQuestion, "Must have an open-ended communication question as question 6");
    assert.strictEqual(commQuestion.category, "Communication");

    // Verify correctAnswer is NEVER returned in the client payload
    for (const q of questions) {
      assert.strictEqual(
        (q as any).correctAnswer,
        undefined,
        `Question #${q.order} must not leak correctAnswer to client`,
      );
    }
    console.log("✓ Test 1 Passed: 5 MCQ + 1 Communication question generated with zero answer leak");

    // Fetch the underlying attempt and DB questions (with answers for testing)
    const attemptA = await prisma.diagnosticAttempt.findFirst({
      where: { userId: userA.id, status: "IN_PROGRESS" },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    assert.ok(attemptA, "Attempt must exist in database in IN_PROGRESS state");
    assert.strictEqual(attemptA.totalQuestions, 6, "Total questions in attempt must be 6");

    // ------------------------------------------------------------
    // TEST 2: Refresh / Resume IN_PROGRESS Attempt
    // ------------------------------------------------------------
    console.log("\n[Test 2] Testing refresh / resume (idempotency without duplicate attempts)...");
    const resumedQuestions = await getDiagnosticQuestions({ userId: userA.id });
    assert.strictEqual(resumedQuestions.length, 6, "Resumed questions must have 6 questions");
    
    const attemptsCount = await prisma.diagnosticAttempt.count({
      where: { userId: userA.id, status: "IN_PROGRESS" },
    });
    assert.strictEqual(attemptsCount, 1, "Must maintain exactly 1 active attempt without duplicate creation");
    console.log("✓ Test 2 Passed: Resume returned existing attempt questions without duplicate generation");

    // ------------------------------------------------------------
    // TEST 3: Answer Submission & Duplicate Answer Update (Upsert)
    // ------------------------------------------------------------
    console.log("\n[Test 3] Testing MCQ answering, communication evaluation, and duplicate answer upsert...");
    
    // Answer MCQ 1 to 4 correctly, MCQ 5 incorrectly
    const dbQuestions = attemptA.questions;
    for (let i = 0; i < 4; i++) {
      const q = dbQuestions[i];
      const ansResult = await submitDiagnosticAnswer(attemptA.id, userA.id, {
        questionId: q.id,
        selectedAnswer: q.correctAnswer, // Correct
      });
      assert.strictEqual(ansResult.isCorrect, true, `MCQ #${q.order} should be marked correct`);
    }

    const q5 = dbQuestions[4];
    const wrongAnswer = q5.options.find((opt) => opt !== q5.correctAnswer) || "Wrong Option";
    const ans5Result = await submitDiagnosticAnswer(attemptA.id, userA.id, {
      questionId: q5.id,
      selectedAnswer: wrongAnswer, // Incorrect
    });
    assert.strictEqual(ans5Result.isCorrect, false, "MCQ #5 should be marked incorrect");

    // Test duplicate answer (updating answer for Q5 to verify upsert)
    const ans5Updated = await submitDiagnosticAnswer(attemptA.id, userA.id, {
      questionId: q5.id,
      selectedAnswer: wrongAnswer,
    });
    assert.strictEqual(ans5Updated.id, ans5Result.id, "Duplicate answer submission should upsert cleanly");

    // Answer Q6: Open-ended communication question
    const q6 = dbQuestions[5];
    const ans6Result = await submitDiagnosticAnswer(attemptA.id, userA.id, {
      questionId: q6.id,
      selectedAnswer: "REST APIs use HTTP verbs like GET, POST, PUT, DELETE for stateless resource operations, while GraphQL uses a single endpoint with queries and mutations to fetch only required fields, avoiding over-fetching and under-fetching.",
    });
    assert.ok(ans6Result.evaluation, "Communication question must produce AI evaluation");
    assert.ok(typeof (ans6Result.evaluation as any).score === "number", "Evaluation must include composite score");
    assert.ok(typeof (ans6Result.evaluation as any).feedback === "string", "Evaluation must include feedback");
    console.log(`✓ Test 3 Passed: MCQs evaluated deterministically; Open-ended Q6 evaluated with AI (${(ans6Result.evaluation as any).score}%)`);

    // ------------------------------------------------------------
    // TEST 4: Attempt Completion, Server Score & SkillState Upsert
    // ------------------------------------------------------------
    console.log("\n[Test 4] Testing attempt completion, server-side scoring & SkillState updates...");
    
    // Expected MCQ score: 4 out of 5 = 80%
    const completionResult = await completeDiagnosticAttempt(attemptA.id, userA.id);
    assert.strictEqual(completionResult.status, "COMPLETED", "Attempt must be marked COMPLETED");
    assert.strictEqual(completionResult.correctAnswers, 4, "Must have 4 correct MCQ answers");
    assert.strictEqual(completionResult.score, 80, "MCQ score must be calculated server-side as 80%");

    // Verify SkillState was created/updated
    const userSkills = await prisma.skillState.findMany({
      where: { userId: userA.id },
    });
    assert.ok(userSkills.length > 0, "SkillState entries must be populated from diagnostic");

    // Verify SkillStateHistory was recorded
    const historyEntries = await prisma.skillStateHistory.findMany({
      where: { userId: userA.id },
    });
    assert.ok(historyEntries.length > 0, "SkillStateHistory must record telemetry on completion");

    // Verify ActivityLog
    const activityLogs = await prisma.activityLog.findMany({
      where: { userId: userA.id, type: "ASSESSMENT" },
    });
    assert.strictEqual(activityLogs.length, 1, "ActivityLog must record the ASSESSMENT event");
    console.log("✓ Test 4 Passed: Server scored 80%, SkillState updated, and ActivityLog emitted");

    // ------------------------------------------------------------
    // TEST 5: IDOR & Security Enforcement
    // ------------------------------------------------------------
    console.log("\n[Test 5] Testing IDOR and ownership enforcement...");
    
    // 1. Cross-user answer submission
    let idorAnswerBlocked = false;
    try {
      await submitDiagnosticAnswer(attemptA.id, userB.id, {
        questionId: dbQuestions[0].id,
        selectedAnswer: "Hacked Answer",
      });
    } catch (err: any) {
      idorAnswerBlocked = true;
      assert.match(err.message, /not found|unauthorized|no longer active/i);
    }
    assert.ok(idorAnswerBlocked, "Cross-user answer submission must be blocked");

    // 2. Cross-user attempt completion
    let idorCompleteBlocked = false;
    try {
      await completeDiagnosticAttempt(attemptA.id, userB.id);
    } catch (err: any) {
      idorCompleteBlocked = true;
      assert.match(err.message, /not found/i);
    }
    assert.ok(idorCompleteBlocked, "Cross-user attempt completion must be blocked");

    // 3. Duplicate completion on already COMPLETED attempt
    let duplicateCompleteBlocked = false;
    try {
      await completeDiagnosticAttempt(attemptA.id, userA.id);
    } catch (err: any) {
      duplicateCompleteBlocked = true;
      assert.match(err.message, /already completed/i);
    }
    assert.ok(duplicateCompleteBlocked, "Duplicate completion on completed attempt must throw error");

    // 4. Incomplete attempt completion (User C)
    const questionsC = await getDiagnosticQuestions({ userId: userC.id });
    const attemptC = await prisma.diagnosticAttempt.findFirst({
      where: { userId: userC.id, status: "IN_PROGRESS" },
    });
    assert.ok(attemptC, "Attempt C must exist");

    // Answer only 1 question
    await submitDiagnosticAnswer(attemptC.id, userC.id, {
      questionId: questionsC[0].id,
      selectedAnswer: "Some Answer",
    });

    let incompleteBlocked = false;
    try {
      await completeDiagnosticAttempt(attemptC.id, userC.id);
    } catch (err: any) {
      incompleteBlocked = true;
      assert.match(err.message, /must be answered/i);
    }
    assert.ok(incompleteBlocked, "Completion of incomplete diagnostic attempt must throw error");
    console.log("✓ Test 5 Passed: IDOR, cross-user, duplicate completion & incomplete attempt guards fully enforced");

    // ------------------------------------------------------------
    // TEST 6: Mock Interview Assessment System
    // ------------------------------------------------------------
    console.log("\n[Test 6] Testing mock interview assessment workflow...");
    const interviewSession = await startInterviewSession(userA.id);
    assert.ok(interviewSession, "Interview session must be created");
    assert.strictEqual(interviewSession.status, "IN_PROGRESS", "Interview status must be IN_PROGRESS");
    assert.strictEqual(interviewSession.questions.length, 3, "Must generate exactly 3 interview questions");

    // Submit answer for Interview Question 1
    const intQ1 = interviewSession.questions[0];
    const intAns1 = await submitInterviewAnswer(
      userA.id,
      intQ1.id,
      "I handle state management by utilizing local React state for UI components, React Context for theme/auth, and server cache like React Query or Redux Toolkit for complex global state.",
    );
    assert.ok(intAns1.evaluation, "Interview answer must have evaluation");
    assert.ok(typeof (intAns1.evaluation as any).clarity === "number", "Evaluation must include clarity score");

    // Cross-user answer to interview
    let interviewIdorBlocked = false;
    try {
      await submitInterviewAnswer(userB.id, intQ1.id, "Malicious answer");
    } catch (err: any) {
      interviewIdorBlocked = true;
      assert.match(err.message, /unauthorized|not found/i);
    }
    assert.ok(interviewIdorBlocked, "Cross-user interview answer must be blocked");

    // Premature interview completion
    let prematureInterviewBlocked = false;
    try {
      await completeInterviewSession(userA.id);
    } catch (err: any) {
      prematureInterviewBlocked = true;
      assert.match(err.message, /not all questions have been answered/i);
    }
    assert.ok(prematureInterviewBlocked, "Premature interview completion must be blocked");
    console.log("✓ Test 6 Passed: Mock interview assessment lifecycle and security verified");

    console.log("\n============================================================");
    console.log("FEATURE 10 VERIFICATION: ALL TESTS PASSED (6/6)");
    console.log("============================================================");
  } finally {
    // Clean up test records safely
    const testIds = [testUserAId, testUserBId, testUserCId];
    for (const uid of testIds) {
      await prisma.diagnosticAnswer.deleteMany({
        where: { attempt: { userId: uid } },
      }).catch(() => {});
      await prisma.diagnosticQuestion.deleteMany({
        where: { attempt: { userId: uid } },
      }).catch(() => {});
      await prisma.diagnosticAttempt.deleteMany({
        where: { userId: uid },
      }).catch(() => {});
      await prisma.interviewAnswer.deleteMany({
        where: { session: { userId: uid } },
      }).catch(() => {});
      await prisma.interviewQuestion.deleteMany({
        where: { session: { userId: uid } },
      }).catch(() => {});
      await prisma.interviewSession.deleteMany({
        where: { userId: uid },
      }).catch(() => {});
      await prisma.skillStateHistory.deleteMany({
        where: { userId: uid },
      }).catch(() => {});
      await prisma.skillState.deleteMany({
        where: { userId: uid },
      }).catch(() => {});
      await prisma.activityLog.deleteMany({
        where: { userId: uid },
      }).catch(() => {});
      await prisma.careerProfile.deleteMany({
        where: { userId: uid },
      }).catch(() => {});
      await prisma.user.delete({
        where: { id: uid },
      }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runFeature10Tests().catch((err) => {
  console.error("Feature 10 Verification Failed:", err);
  process.exit(1);
});
