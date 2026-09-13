import assert from "node:assert";
import prisma from "../src/lib/prisma.js";
import { getAdaptiveLearningDecision } from "../src/modules/learner/roadmap/services/adaptive-learning.service.js";

async function runFeature06Tests() {
  console.log("============================================================");
  console.log("FEATURE 06 — ADAPTIVE LEARNING ENGINE VERIFICATION");
  console.log("============================================================");

  const testUserId = `f06-usr-${Date.now()}`;
  let testUser: any = null;

  try {
    testUser = await prisma.user.create({
      data: {
        id: testUserId,
        name: "Adaptive Engine Tester",
        email: `f06-${Date.now()}@example.com`,
        emailVerified: true,
        role: "LEARNER",
      }
    });

    await prisma.careerProfile.create({
      data: {
        userId: testUser.id,
        targetRole: "FULL_STACK_ENGINEER",
        targetRoleName: "Full Stack Developer",
        experienceLevel: "BEGINNER",
        weeklyAvailableHours: 15,
        onboardingCompleted: true,
      }
    });

    const roadmap = await prisma.roadmap.create({
      data: {
        userId: testUser.id,
        targetRole: "Full Stack Developer",
        status: "ACTIVE",
      }
    });

    const milestone1 = await prisma.milestone.create({
      data: {
        roadmapId: roadmap.id,
        order: 1,
        title: "Frontend & Full-Stack Core",
        description: "Build foundational UI and server integrations",
        status: "CURRENT",
        unlocks: ["JavaScript", "TypeScript", "React"],
      }
    });

    // ------------------------------------------------------------
    // TEST 1: Decision Branch — INITIAL_DIAGNOSTIC
    // ------------------------------------------------------------
    console.log("\n[Test 1] Testing INITIAL_DIAGNOSTIC branch (no diagnostic taken)...");
    const decision1 = await getAdaptiveLearningDecision(testUser.id);
    assert.strictEqual(decision1.type, "INITIAL_DIAGNOSTIC");
    assert.strictEqual(decision1.urgency, "CRITICAL");
    assert.strictEqual(decision1.href, "/diagnostic");
    assert.ok(decision1.reason.length > 0, "Must have explainable reasoning");
    console.log(`✓ Test 1 Passed: Generated decision "${decision1.type}" - "${decision1.title}"`);

    // Complete a diagnostic attempt
    await prisma.diagnosticAttempt.create({
      data: {
        userId: testUser.id,
        targetRole: "Full Stack Developer",
        status: "COMPLETED",
        score: 75,
        completedAt: new Date(),
      }
    });

    // ------------------------------------------------------------
    // TEST 2: Decision Branch — REMEDIATE_GAP (Critical Knowledge Gap < 40%)
    // ------------------------------------------------------------
    console.log("\n[Test 2] Testing REMEDIATE_GAP branch (critical skill knowledge < 40%)...");
    await prisma.skillState.create({
      data: {
        userId: testUser.id,
        skillName: "TypeScript",
        knowledgeScore: 25, // Critical gap
        practiceScore: 20,
        projectScore: 0,
        evidenceScore: 0,
      }
    });

    const decision2 = await getAdaptiveLearningDecision(testUser.id);
    assert.strictEqual(decision2.type, "REMEDIATE_GAP");
    assert.strictEqual(decision2.urgency, "CRITICAL");
    assert.strictEqual(decision2.targetSkill, "TypeScript");
    assert.strictEqual(decision2.href, "/dashboard/learner/skill-gaps");
    assert.ok(decision2.reason.includes("critically low"), "Must explain the critical knowledge gap");
    console.log(`✓ Test 2 Passed: Generated decision "${decision2.type}" targeting "${decision2.targetSkill}"`);

    // ------------------------------------------------------------
    // TEST 3: Decision Branch — BUILD_PROJECT_EVIDENCE (Knowledge >= 70%, Evidence < 20%)
    // ------------------------------------------------------------
    console.log("\n[Test 3] Testing BUILD_PROJECT_EVIDENCE branch (knowledge high, evidence missing)...");
    await prisma.skillState.update({
      where: { userId_skillName: { userId: testUser.id, skillName: "TypeScript" } },
      data: {
        knowledgeScore: 85,
        practiceScore: 70,
        evidenceScore: 0, // Missing evidence
      }
    });

    const decision3 = await getAdaptiveLearningDecision(testUser.id);
    assert.strictEqual(decision3.type, "BUILD_PROJECT_EVIDENCE");
    assert.strictEqual(decision3.urgency, "HIGH");
    assert.strictEqual(decision3.targetSkill, "TypeScript");
    assert.strictEqual(decision3.href, "/dashboard/learner/portfolio");
    assert.ok(decision3.reason.includes("verifiable evidence"), "Must explain the missing project evidence");
    console.log(`✓ Test 3 Passed: Generated decision "${decision3.type}" - "${decision3.title}"`);

    // ------------------------------------------------------------
    // TEST 4: Decision Branch — PRACTICE_ASSESSMENT (Knowledge >= 60%, Practice < 40%)
    // ------------------------------------------------------------
    console.log("\n[Test 4] Testing PRACTICE_ASSESSMENT branch (knowledge intermediate, practice low)...");
    await prisma.skillState.update({
      where: { userId_skillName: { userId: testUser.id, skillName: "TypeScript" } },
      data: {
        knowledgeScore: 65,
        practiceScore: 20, // Practice gap
        evidenceScore: 30,
      }
    });

    const decision4 = await getAdaptiveLearningDecision(testUser.id);
    assert.strictEqual(decision4.type, "PRACTICE_ASSESSMENT");
    assert.strictEqual(decision4.urgency, "MEDIUM");
    assert.strictEqual(decision4.targetSkill, "TypeScript");
    assert.strictEqual(decision4.href, "/dashboard/learner/assessments");
    assert.ok(decision4.reason.includes("problem solving") || decision4.reason.includes("practice"), "Must explain the practice need");
    console.log(`✓ Test 4 Passed: Generated decision "${decision4.type}" - "${decision4.title}"`);

    // ------------------------------------------------------------
    // TEST 5: Decision Branch — MOCK_INTERVIEW (All Skills >= 70%, Verified Project, No Interview)
    // ------------------------------------------------------------
    console.log("\n[Test 5] Testing MOCK_INTERVIEW branch (high mastery + verified project)...");
    await prisma.skillState.update({
      where: { userId_skillName: { userId: testUser.id, skillName: "TypeScript" } },
      data: { knowledgeScore: 85, practiceScore: 80, evidenceScore: 60 }
    });

    await prisma.skillState.createMany({
      data: [
        { userId: testUser.id, skillName: "JavaScript", knowledgeScore: 90, practiceScore: 85, evidenceScore: 70 },
        { userId: testUser.id, skillName: "React", knowledgeScore: 85, practiceScore: 80, evidenceScore: 60 }
      ]
    });

    await prisma.project.create({
      data: {
        userId: testUser.id,
        title: "Full Stack Portfolio App",
        description: "Verified full stack production system",
        techStack: ["TypeScript", "React", "Node.js"],
        isVerified: true,
        score: 90,
      }
    });

    const decision5 = await getAdaptiveLearningDecision(testUser.id);
    assert.strictEqual(decision5.type, "MOCK_INTERVIEW");
    assert.strictEqual(decision5.urgency, "HIGH");
    assert.strictEqual(decision5.href, "/dashboard/learner/interview");
    assert.ok(decision5.reason.includes("interview"), "Must explain mock interview readiness");
    console.log(`✓ Test 5 Passed: Generated decision "${decision5.type}" - "${decision5.title}"`);

    // ------------------------------------------------------------
    // TEST 6: Decision Branch — ACCELERATE_MILESTONE (Milestone Skills >= 80% & Interview completed)
    // ------------------------------------------------------------
    console.log("\n[Test 6] Testing ACCELERATE_MILESTONE branch (milestone skills >= 80%)...");
    await prisma.interviewSession.create({
      data: {
        userId: testUser.id,
        targetRole: "Full Stack Developer",
        status: "COMPLETED",
        score: 88,
        completedAt: new Date(),
      }
    });

    const decision6 = await getAdaptiveLearningDecision(testUser.id);
    assert.strictEqual(decision6.type, "ACCELERATE_MILESTONE");
    assert.strictEqual(decision6.urgency, "LOW");
    assert.strictEqual(decision6.href, "/dashboard/learner/learning-path");
    assert.strictEqual(decision6.targetMilestone?.id, milestone1.id);
    console.log(`✓ Test 6 Passed: Generated decision "${decision6.type}" for milestone "${decision6.targetMilestone?.title}"`);

    // ------------------------------------------------------------
    // TEST 7: Decision Branch — CONTINUE_ROADMAP (Standard Progress)
    // ------------------------------------------------------------
    console.log("\n[Test 7] Testing CONTINUE_ROADMAP branch (standard learning pace)...");
    await prisma.skillState.update({
      where: { userId_skillName: { userId: testUser.id, skillName: "TypeScript" } },
      data: { knowledgeScore: 50, practiceScore: 50, evidenceScore: 30 }
    });

    const decision7 = await getAdaptiveLearningDecision(testUser.id);
    assert.strictEqual(decision7.type, "CONTINUE_ROADMAP");
    assert.strictEqual(decision7.urgency, "LOW");
    assert.strictEqual(decision7.href, "/dashboard/learner/learning-path");
    assert.strictEqual(decision7.targetMilestone?.id, milestone1.id);
    console.log(`✓ Test 7 Passed: Generated decision "${decision7.type}" - "${decision7.title}"`);

    console.log("\n============================================================");
    console.log("FEATURE 06 VERIFICATION: ALL DECISION BRANCHES PASSED (7/7)");
    console.log("============================================================");
  } finally {
    if (testUser?.id) {
      await prisma.interviewAnswer.deleteMany({ where: { session: { userId: testUser.id } } }).catch(() => {});
      await prisma.interviewSession.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.projectEvidence.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.project.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.diagnosticAnswer.deleteMany({ where: { attempt: { userId: testUser.id } } }).catch(() => {});
      await prisma.diagnosticAttempt.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.milestone.deleteMany({ where: { roadmap: { userId: testUser.id } } }).catch(() => {});
      await prisma.roadmap.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.skillState.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.careerProfile.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runFeature06Tests().catch((err) => {
  console.error("Feature 06 Verification Failed:", err);
  process.exit(1);
});
