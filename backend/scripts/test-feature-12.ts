import assert from "node:assert";
import prisma from "../src/lib/prisma.js";
import { getCareerReadiness } from "../src/modules/learner/readiness/services/readiness.service.js";
import { getProofGraph } from "../src/modules/learner/proof-graph/services/proof-graph.service.js";
import { getCareerTwin } from "../src/modules/learner/career-twin/services/career-twin.service.js";
import { getApplicationReadiness } from "../src/modules/learner/application-readiness/services/application-readiness.service.js";
import { createProject } from "../src/modules/learner/projects/services/portfolio.service.js";

async function runFeature12Tests() {
  console.log("============================================================");
  console.log("FEATURE 12 — LEARNING EVIDENCE & CAREER READINESS VERIFICATION");
  console.log("============================================================");

  const testUserAId = `f12-usrA-${Date.now()}`;
  const testUserBId = `f12-usrB-${Date.now()}`;

  try {
    // ------------------------------------------------------------
    // SEED TEST USERS
    // ------------------------------------------------------------
    const userA = await prisma.user.create({
      data: {
        id: testUserAId,
        name: "Readiness Tester A",
        email: `f12-a-${Date.now()}@example.com`,
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
        name: "Readiness Tester B (Cross-User)",
        email: `f12-b-${Date.now()}@example.com`,
        emailVerified: true,
        role: "LEARNER",
        careerProfile: {
          create: {
            targetRole: "Backend Developer",
            targetRoleName: "Backend Developer",
            experienceLevel: "BEGINNER",
            weeklyAvailableHours: 10,
          },
        },
      },
      include: { careerProfile: true },
    });

    // ------------------------------------------------------------
    // TEST 1: New Learner Empty State (Zero Evidence / Assessments)
    // ------------------------------------------------------------
    console.log("\n[Test 1] Testing new learner clean empty state across readiness & proof graph...");
    const emptyReadiness = await getCareerReadiness(userA.id);
    assert.strictEqual(emptyReadiness.score, 0, "Initial overall score must be 0");
    assert.strictEqual(emptyReadiness.scores.knowledge, "NOT_ASSESSED");
    assert.strictEqual(emptyReadiness.scores.projects, "NOT_ASSESSED");
    assert.strictEqual(emptyReadiness.scores.interview, "NOT_ASSESSED");
    assert.strictEqual(emptyReadiness.scores.evidence, "NOT_ASSESSED");

    const emptyProofGraph = await getProofGraph(userA.id);
    assert.strictEqual(emptyProofGraph.overallProofScore, 0, "Proof score must be 0");
    assert.strictEqual(emptyProofGraph.nodes.length, 1, "Should have empty state fallback node");
    assert.strictEqual(emptyProofGraph.nodes[0].id, "empty-state-node");

    const emptyTwin = await getCareerTwin(userA.id);
    assert.strictEqual(emptyTwin.readinessScore, 0, "Career twin readiness score must be 0");
    assert.strictEqual(emptyTwin.scores.knowledge, 0);

    const emptyAppReadiness = await getApplicationReadiness(userA.id);
    assert.strictEqual(emptyAppReadiness.overallScore, 0);
    assert.strictEqual(emptyAppReadiness.isReady, false, "Must not be application ready");
    console.log("✓ Test 1 Passed: Clean empty state verified across all 4 services");

    // ------------------------------------------------------------
    // TEST 2: Assessment Only (MCQ + Problem Solving Q4 + Open-Ended Q6)
    // ------------------------------------------------------------
    console.log("\n[Test 2] Testing readiness & proof graph after diagnostic assessment completion...");
    
    // Seed diagnostic attempt with Q4 and Q6
    const diagAttempt = await prisma.diagnosticAttempt.create({
      data: {
        userId: userA.id,
        targetRole: "Full-Stack Developer",
        status: "COMPLETED",
        totalQuestions: 6,
        answeredQuestions: 6,
        score: 80,
        completedAt: new Date(),
      },
    });

    const q4 = await prisma.diagnosticQuestion.create({
      data: {
        attemptId: diagAttempt.id,
        question: "How to resolve a race condition?",
        category: "Backend",
        skill: "TypeScript",
        options: ["A", "B"],
        correctAnswer: "A",
        difficulty: "intermediate",
        order: 4,
      },
    });

    const q6 = await prisma.diagnosticQuestion.create({
      data: {
        attemptId: diagAttempt.id,
        question: "Explain RESTful API architecture",
        category: "Communication",
        skill: "Technical Communication",
        options: [],
        correctAnswer: "",
        difficulty: "intermediate",
        order: 6,
      },
    });

    await prisma.diagnosticAnswer.createMany({
      data: [
        {
          attemptId: diagAttempt.id,
          questionId: q4.id,
          selectedAnswer: "A",
          isCorrect: true,
        },
        {
          attemptId: diagAttempt.id,
          questionId: q6.id,
          selectedAnswer: "REST is an architectural style based on HTTP verbs...",
          isCorrect: false,
          evaluation: {
            clarity: 80,
            structure: 85,
            technicalExplanation: 90,
            relevance: 85,
            completeness: 80,
            score: 84,
            feedback: "Clear technical explanation.",
          },
        },
      ],
    });

    // Seed SkillState from diagnostic
    await prisma.skillState.create({
      data: {
        userId: userA.id,
        skillName: "TypeScript",
        knowledgeScore: 80,
        practiceScore: 60,
        projectScore: 0,
        evidenceScore: 0,
      },
    });

    const assessmentReadiness = await getCareerReadiness(userA.id);
    assert.strictEqual(assessmentReadiness.scores.knowledge, 80, "Knowledge score must be 80");
    assert.strictEqual(assessmentReadiness.scores.practical, 60, "Practice score must be 60");
    assert.strictEqual(assessmentReadiness.scores.problemSolving, 100, "Problem solving (Q4) must be 100");
    assert.strictEqual(assessmentReadiness.scores.communication, 84, "Communication (Q6) must be 84");
    assert.ok(assessmentReadiness.score > 0, "Overall score must be computed from active dimensions");
    console.log(`✓ Test 2 Passed: Assessment dimensions scored accurately (Knowledge: 80%, PS: 100%, Comm: 84%, Overall: ${assessmentReadiness.score}%)`);

    // ------------------------------------------------------------
    // TEST 3: Projects & Verified Evidence Graph Integration
    // ------------------------------------------------------------
    console.log("\n[Test 3] Testing project evidence generation, verification & Proof Graph DAG...");
    
    // Create verified project with TypeScript & React
    const project = await createProject(userA.id, {
      title: "Real-Time Collaboration Platform",
      description: "Full-Stack workspace with live sockets and Redis caching",
      repositoryUrl: "https://github.com/facebook/react",
      liveUrl: "https://react.dev",
      techStack: ["TypeScript", "React"],
    });

    assert.strictEqual(project.isVerified, true, "Valid HTTPS GitHub repository must be verified");

    const projectReadiness = await getCareerReadiness(userA.id);
    assert.ok(typeof projectReadiness.scores.projects === "number", "Projects score must be assessed");
    assert.ok(typeof projectReadiness.scores.evidence === "number", "Evidence score must be assessed");

    // Verify Proof Graph DAG
    const proofGraph = await getProofGraph(userA.id);
    assert.ok(proofGraph.overallProofScore > 0, "Proof score must increase with verified project");
    
    const skillNode = proofGraph.nodes.find((n) => n.type === "skill" && n.title === "TypeScript");
    assert.ok(skillNode, "Skill node for TypeScript must exist");

    const projectNode = proofGraph.nodes.find((n) => n.type === "project");
    assert.ok(projectNode, "Project node must exist");

    const hasSkillToEvidenceEdge = proofGraph.edges.some(
      (e) => e.source === skillNode.id && e.label === "backed by",
    );
    const hasEvidenceToProjectEdge = proofGraph.edges.some(
      (e) => e.target === projectNode.id && e.label === "from",
    );
    assert.ok(hasSkillToEvidenceEdge, "Skill must be connected to Evidence with 'backed by' edge");
    assert.ok(hasEvidenceToProjectEdge, "Evidence must be connected to Project with 'from' edge");
    console.log(`✓ Test 3 Passed: Proof Graph DAG correctly links Skill -> Evidence -> Verified Project (Proof Score: ${proofGraph.overallProofScore}%)`);

    // ------------------------------------------------------------
    // TEST 4: Mock Interview Assessment Dimension
    // ------------------------------------------------------------
    console.log("\n[Test 4] Testing interview completion dimension & Career Twin...");
    await prisma.careerProfile.update({
      where: { userId: userA.id },
      data: { interviewScore: 88 },
    });

    const interviewSession = await prisma.interviewSession.create({
      data: {
        userId: userA.id,
        targetRole: "Full-Stack Developer",
        status: "COMPLETED",
        score: 88,
        completedAt: new Date(),
      },
    });

    const interviewReadiness = await getCareerReadiness(userA.id);
    assert.strictEqual(interviewReadiness.scores.interview, 88, "Interview score must be 88");

    const twin = await getCareerTwin(userA.id);
    assert.strictEqual(twin.scores.interview, 88, "Twin radar must reflect 88 interview score");
    assert.strictEqual(twin.scores.knowledge, 40, "Twin knowledge score must be 40 (average of TS 80 and React 0)");
    assert.ok(twin.readinessScore > 50, "Twin readiness score must aggregate all dimensions");
    console.log(`✓ Test 4 Passed: Interview dimension active (88%), Twin radar aggregated (${twin.readinessScore}%)`);

    // ------------------------------------------------------------
    // TEST 5: Comprehensive Readiness & Application Readiness Gate
    // ------------------------------------------------------------
    console.log("\n[Test 5] Testing Application Readiness qualification gate...");
    
    // Ensure all metrics are strong (>= 75%)
    await prisma.skillState.updateMany({
      where: { userId: userA.id },
      data: {
        knowledgeScore: 85,
        practiceScore: 80,
        projectScore: 85,
        evidenceScore: 80,
      },
    });

    const appReadiness = await getApplicationReadiness(userA.id);
    assert.ok(appReadiness.overallScore >= 75, "Overall readiness score must meet or exceed 75%");
    assert.strictEqual(appReadiness.isReady, true, "Learner must be marked application ready (isReady: true)");
    assert.strictEqual(appReadiness.categories.length, 3, "Must have 3 assessment categories");
    assert.strictEqual(appReadiness.categories[0].status, "strong", "Technical category must be strong");
    console.log(`✓ Test 5 Passed: Application Readiness gate PASSED (Score: ${appReadiness.overallScore}%, isReady: ${appReadiness.isReady})`);

    // ------------------------------------------------------------
    // TEST 6: Multi-Tenant Data Isolation & IDOR Protection
    // ------------------------------------------------------------
    console.log("\n[Test 6] Testing cross-user isolation across all readiness endpoints...");
    const readinessB = await getCareerReadiness(userB.id);
    assert.strictEqual(readinessB.score, 0, "User B readiness score must be 0");
    assert.strictEqual(readinessB.scores.knowledge, "NOT_ASSESSED");

    const proofGraphB = await getProofGraph(userB.id);
    assert.strictEqual(proofGraphB.overallProofScore, 0, "User B proof score must be 0");
    assert.strictEqual(proofGraphB.nodes[0].id, "empty-state-node");

    const appReadinessB = await getApplicationReadiness(userB.id);
    assert.strictEqual(appReadinessB.overallScore, 0);
    assert.strictEqual(appReadinessB.isReady, false, "User B must not be ready");
    console.log("✓ Test 6 Passed: Multi-tenant data isolation strictly enforced");

    console.log("\n============================================================");
    console.log("FEATURE 12 VERIFICATION: ALL TESTS PASSED (6/6)");
    console.log("============================================================");
  } finally {
    const testIds = [testUserAId, testUserBId];
    for (const uid of testIds) {
      await prisma.projectEvidence.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.project.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.diagnosticAnswer.deleteMany({ where: { attempt: { userId: uid } } }).catch(() => {});
      await prisma.diagnosticQuestion.deleteMany({ where: { attempt: { userId: uid } } }).catch(() => {});
      await prisma.diagnosticAttempt.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.interviewAnswer.deleteMany({ where: { session: { userId: uid } } }).catch(() => {});
      await prisma.interviewQuestion.deleteMany({ where: { session: { userId: uid } } }).catch(() => {});
      await prisma.interviewSession.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.userAchievement.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.xPTransaction.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.userGamification.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.skillStateHistory.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.skillState.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.careerProfile.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.user.delete({ where: { id: uid } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runFeature12Tests().catch((err) => {
  console.error("Feature 12 Verification Failed:", err);
  process.exit(1);
});
