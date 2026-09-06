import { config } from "dotenv";
config();
import prisma from "../src/lib/prisma.js";
import {
  classifySkillScore,
  classifySkillGapSeverity,
  classifySkillGapLevel,
} from "../src/modules/learner/diagnostic/constants/diagnostic-thresholds.js";
import {
  getDiagnosticResult,
  getLatestDiagnosticResult,
} from "../src/modules/learner/diagnostic/services/diagnostic-result.service.js";
import { completeDiagnosticAttempt } from "../src/modules/learner/diagnostic/services/diagnostic-attempt.service.js";

async function runTests() {
  console.log("=================================================");
  console.log("DIAGNOSTIC RESULT & SKILL GAP ANALYSIS TEST SUITE");
  console.log("=================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      process.exitCode = 1;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Deterministic Threshold Classification
  // -------------------------------------------------------------
  console.log("\n--- TEST 1: Centralized Scoring Thresholds ---");
  assert(classifySkillScore(100) === "STRONG", "100% is STRONG");
  assert(classifySkillScore(80) === "STRONG", "80% is STRONG");
  assert(classifySkillScore(79) === "MEDIUM", "79% is MEDIUM");
  assert(classifySkillScore(50) === "MEDIUM", "50% is MEDIUM");
  assert(classifySkillScore(49) === "WEAK", "49% is WEAK");
  assert(classifySkillScore(0) === "WEAK", "0% is WEAK");

  assert(classifySkillGapSeverity(35) === "critical", "35% is critical severity");
  assert(classifySkillGapSeverity(65) === "moderate", "65% is moderate severity");
  assert(classifySkillGapSeverity(85) === "none", "85% is none severity");

  assert(classifySkillGapLevel(35) === "HIGH", "35% has HIGH gap level");
  assert(classifySkillGapLevel(65) === "MEDIUM", "65% has MEDIUM gap level");
  assert(classifySkillGapLevel(85) === "NONE", "85% has NONE gap level");

  // -------------------------------------------------------------
  // TEST 2: Real Database Flow with End-to-End Attempt
  // -------------------------------------------------------------
  console.log("\n--- TEST 2: Real DB Attempt with Mixed Skills & Communication ---");

  // Find or create test user
  let user = await prisma.user.findFirst({
    where: { email: "test-diagnostic-learner@example.com" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: "test-diagnostic-user-id-" + Date.now(),
        name: "Diagnostic Test User",
        email: "test-diagnostic-learner@example.com",
        emailVerified: true,
        role: "LEARNER",
      },
    });
  }

  // Ensure career profile exists
  await prisma.careerProfile.upsert({
    where: { userId: user.id },
    update: { targetRole: "Full Stack Developer", targetRoleName: "Full Stack Developer" },
    create: {
      userId: user.id,
      targetRole: "Full Stack Developer",
      targetRoleName: "Full Stack Developer",
      experienceLevel: "INTERMEDIATE",
    },
  });

  // Create a 6-question attempt
  const attempt = await prisma.diagnosticAttempt.create({
    data: {
      userId: user.id,
      targetRole: "Full Stack Developer",
      status: "IN_PROGRESS",
      totalQuestions: 6,
      answeredQuestions: 0,
    },
  });

  // Create 5 MCQs and 1 Communication question
  // Skills:
  // React: 2 questions (Answer 1 correct, Answer 2 correct) -> 100% STRONG
  // Node.js: 2 questions (Answer 3 correct, Answer 4 wrong) -> 50% MEDIUM
  // PostgreSQL: 1 question (Answer 5 wrong) -> 0% WEAK
  // Communication: 1 question (Order 6, open-ended) -> 84%
  const qReact1 = await prisma.diagnosticQuestion.create({
    data: {
      attemptId: attempt.id,
      question: "What is useEffect used for?",
      category: "Frontend",
      skill: "React",
      options: ["Side effects", "Routing", "Styling", "Database"],
      correctAnswer: "Side effects",
      difficulty: "Intermediate",
      order: 1,
    },
  });

  const qReact2 = await prisma.diagnosticQuestion.create({
    data: {
      attemptId: attempt.id,
      question: "What is virtual DOM?",
      category: "Frontend",
      skill: "React",
      options: ["In-memory representation", "Direct browser DOM", "A CSS file", "A compiler"],
      correctAnswer: "In-memory representation",
      difficulty: "Intermediate",
      order: 2,
    },
  });

  const qNode1 = await prisma.diagnosticQuestion.create({
    data: {
      attemptId: attempt.id,
      question: "What handles async I/O in Node?",
      category: "Backend",
      skill: "Node.js",
      options: ["Event loop", "Thread pool only", "HTML parser", "Virtual machine"],
      correctAnswer: "Event loop",
      difficulty: "Intermediate",
      order: 3,
    },
  });

  const qNode2 = await prisma.diagnosticQuestion.create({
    data: {
      attemptId: attempt.id,
      question: "What is Express middleware?",
      category: "Backend",
      skill: "Node.js",
      options: ["A function with req, res, next", "A CSS framework", "A database engine", "A browser API"],
      correctAnswer: "A function with req, res, next",
      difficulty: "Intermediate",
      order: 4,
    },
  });

  const qPostgres = await prisma.diagnosticQuestion.create({
    data: {
      attemptId: attempt.id,
      question: "What does an index do in PostgreSQL?",
      category: "Database",
      skill: "PostgreSQL",
      options: ["Speeds up queries", "Slows down queries", "Deletes duplicates", "Formats text"],
      correctAnswer: "Speeds up queries",
      difficulty: "Intermediate",
      order: 5,
    },
  });

  const qComm = await prisma.diagnosticQuestion.create({
    data: {
      attemptId: attempt.id,
      question: "Explain how you handle database connection pooling in high traffic apps.",
      category: "Architecture",
      skill: "Technical Communication",
      options: [],
      correctAnswer: "",
      difficulty: "Intermediate",
      order: 6,
    },
  });

  // Submit answers:
  // Q1: correct
  await prisma.diagnosticAnswer.create({
    data: {
      attemptId: attempt.id,
      questionId: qReact1.id,
      selectedAnswer: "Side effects",
      isCorrect: true,
    },
  });

  // Q2: correct
  await prisma.diagnosticAnswer.create({
    data: {
      attemptId: attempt.id,
      questionId: qReact2.id,
      selectedAnswer: "In-memory representation",
      isCorrect: true,
    },
  });

  // Q3: correct
  await prisma.diagnosticAnswer.create({
    data: {
      attemptId: attempt.id,
      questionId: qNode1.id,
      selectedAnswer: "Event loop",
      isCorrect: true,
    },
  });

  // Q4: wrong
  await prisma.diagnosticAnswer.create({
    data: {
      attemptId: attempt.id,
      questionId: qNode2.id,
      selectedAnswer: "A CSS framework",
      isCorrect: false,
    },
  });

  // Q5: wrong
  await prisma.diagnosticAnswer.create({
    data: {
      attemptId: attempt.id,
      questionId: qPostgres.id,
      selectedAnswer: "Formats text",
      isCorrect: false,
    },
  });

  // Q6: Communication with stored evaluation
  const mockCommunicationEval = {
    clarity: 85,
    structure: 80,
    technicalExplanation: 90,
    relevance: 85,
    completeness: 80,
    score: 84,
    feedback: "Strong explanation of connection limits and lifecycle recycling.",
  };

  await prisma.diagnosticAnswer.create({
    data: {
      attemptId: attempt.id,
      questionId: qComm.id,
      selectedAnswer: "In production, we configure a connection pool with pg-pool, limiting max connections to prevent DB exhaustion and managing idle timeouts.",
      isCorrect: false,
      evaluation: mockCommunicationEval,
    },
  });

  // Complete attempt
  const completionResult = await completeDiagnosticAttempt(attempt.id, user.id);

  console.log("\n--- TEST 3: Verification of Completion & Result Output ---");
  // Total correct MCQ: 3 out of 5 -> 60%
  assert(completionResult.overallScore === 60, `Overall score is 60% (got ${completionResult.overallScore}%)`);
  assert(completionResult.correctAnswers === 3, `3 correct MCQ answers (got ${completionResult.correctAnswers})`);
  assert(completionResult.totalQuestions === 6, `Total questions is 6 (got ${completionResult.totalQuestions})`);

  // Verify skills array
  assert(completionResult.skills.length === 3, `Evaluated 3 distinct skills (got ${completionResult.skills.length})`);
  const reactSkill = completionResult.skills.find((s) => s.skill === "React");
  const nodeSkill = completionResult.skills.find((s) => s.skill === "Node.js");
  const pgSkill = completionResult.skills.find((s) => s.skill === "PostgreSQL");

  assert(!!reactSkill && reactSkill.score === 100 && reactSkill.status === "STRONG", "React is 100% STRONG");
  assert(!!nodeSkill && nodeSkill.score === 50 && nodeSkill.status === "MEDIUM", "Node.js is 50% MEDIUM");
  assert(!!pgSkill && pgSkill.score === 0 && pgSkill.status === "WEAK", "PostgreSQL is 0% WEAK");

  // Verify Strengths list
  assert(completionResult.strengths.length === 1 && completionResult.strengths[0].skill === "React", "React is the only strong skill");

  // Verify Skill Gaps list
  assert(completionResult.skillGaps.length === 2, `2 skill gaps detected (got ${completionResult.skillGaps.length})`);
  assert(completionResult.skillGaps[0].skill === "PostgreSQL" && completionResult.skillGaps[0].gapLevel === "HIGH", "PostgreSQL is a HIGH gap");
  assert(completionResult.skillGaps[1].skill === "Node.js" && completionResult.skillGaps[1].gapLevel === "MEDIUM", "Node.js is a MEDIUM gap");

  // Verify Communication
  assert(completionResult.communication.isAvailable === true, "Communication is available");
  assert(completionResult.communication.score === 84, "Communication score is 84%");
  assert(completionResult.communication.clarity === 85, "Communication clarity is 85%");
  assert(completionResult.communication.feedback.includes("Strong explanation"), "AI feedback preserved");
  assert(completionResult.communication.transcript.includes("connection pool"), "Candidate transcript preserved");

  // Verify Recommendations
  assert(completionResult.recommendations.length >= 2, `Has recommendations (${completionResult.recommendations.length})`);
  const pgRec = completionResult.recommendations.find((r) => r.skillName === "PostgreSQL");
  assert(!!pgRec && pgRec.priority === "HIGH", "PostgreSQL recommended as HIGH priority");

  // Verify SkillState was updated in DB
  const pgSkillState = await prisma.skillState.findUnique({
    where: { userId_skillName: { userId: user.id, skillName: "PostgreSQL" } },
  });
  const reactSkillState = await prisma.skillState.findUnique({
    where: { userId_skillName: { userId: user.id, skillName: "React" } },
  });
  assert(pgSkillState?.knowledgeScore === 0, "PostgreSQL SkillState knowledgeScore is 0%");
  assert(reactSkillState?.knowledgeScore === 100, "React SkillState knowledgeScore is 100%");

  // -------------------------------------------------------------
  // TEST 4: Authorization and Security
  // -------------------------------------------------------------
  console.log("\n--- TEST 4: Authorization and Ownership Enforcements ---");
  let unauthorizedRejected = false;
  try {
    await getDiagnosticResult(attempt.id, "fake-attacker-user-id");
  } catch (err: any) {
    unauthorizedRejected = true;
    assert(err.message.includes("unauthorized") || err.message.includes("not found"), "Wrong user rejected with 404/unauthorized error");
  }
  assert(unauthorizedRejected, "Access to another user's attempt strictly blocked");

  // -------------------------------------------------------------
  // TEST 5: getLatestDiagnosticResult
  // -------------------------------------------------------------
  console.log("\n--- TEST 5: getLatestDiagnosticResult ---");
  const latestResult = await getLatestDiagnosticResult(user.id);
  assert(!!latestResult && latestResult.id === attempt.id, "Latest diagnostic result matches completed attempt");

  // Clean up test attempt and records
  await prisma.diagnosticAnswer.deleteMany({ where: { attemptId: attempt.id } });
  await prisma.diagnosticQuestion.deleteMany({ where: { attemptId: attempt.id } });
  await prisma.diagnosticAttempt.delete({ where: { id: attempt.id } });
  await prisma.skillState.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });

  console.log(`\n=================================================`);
  console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} tests passed`);
  console.log(`=================================================`);

  if (passedTests === totalTests) {
    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!\n");
    process.exit(0);
  } else {
    console.error("\n💥 SOME TESTS FAILED!\n");
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
