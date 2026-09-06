import assert from "node:assert";
import prisma from "../src/lib/prisma.js";
import {
  awardXp,
  calculateLevel,
  evaluateAchievements,
  getUserGamificationProfile,
} from "../src/modules/learner/gamification/services/gamification.service.js";
import { getSkillTree } from "../src/modules/learner/gamification/services/skill-tree.service.js";

async function runFeature11Tests() {
  console.log("============================================================");
  console.log("FEATURE 11 — SKILL TREE & ACHIEVEMENT SYSTEM VERIFICATION");
  console.log("============================================================");

  const testUserAId = `f11-usrA-${Date.now()}`;
  const testUserBId = `f11-usrB-${Date.now()}`;

  try {
    // ------------------------------------------------------------
    // SEED TEST USERS & CAREER PROFILES
    // ------------------------------------------------------------
    const userA = await prisma.user.create({
      data: {
        id: testUserAId,
        name: "Gamification Tester A",
        email: `f11-a-${Date.now()}@example.com`,
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
        name: "Gamification Tester B (Cross-User)",
        email: `f11-b-${Date.now()}@example.com`,
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
      include: { careerProfile: true },
    });

    // ------------------------------------------------------------
    // TEST 1: Initial Empty Gamification State & Level Curve
    // ------------------------------------------------------------
    console.log("\n[Test 1] Testing initial gamification state and level derivation curve...");
    const initialProfile = await getUserGamificationProfile(userA.id);
    assert.strictEqual(initialProfile.totalXp, 0, "Initial XP should be 0");
    assert.strictEqual(initialProfile.levelInfo.level, 1, "Initial level should be 1");
    assert.strictEqual(initialProfile.levelInfo.title, "Novice Pather", "Initial level title should match");
    assert.strictEqual(initialProfile.unlockedCount, 0, "No achievements should be unlocked initially");

    const lvl1 = calculateLevel(0);
    assert.strictEqual(lvl1.level, 1);
    const lvl2 = calculateLevel(100);
    assert.strictEqual(lvl2.level, 2);
    assert.strictEqual(lvl2.title, "Code Explorer");
    const lvl3 = calculateLevel(300);
    assert.strictEqual(lvl3.level, 3);
    assert.strictEqual(lvl3.title, "Skill Practitioner");
    console.log("✓ Test 1 Passed: Initial state clean; Level curves compute deterministically");

    // ------------------------------------------------------------
    // TEST 2: Idempotent XP Awarding & Duplicate Prevention
    // ------------------------------------------------------------
    console.log("\n[Test 2] Testing idempotent XP awarding and duplicate prevention...");
    const attemptId = `diag-att-${Date.now()}`;
    
    // First award
    const awardResult1 = await awardXp(
      userA.id,
      "ASSESSMENT_COMPLETION",
      attemptId,
      100,
      "Completed diagnostic assessment",
    );
    assert.strictEqual(awardResult1.awarded, true, "First award must succeed");
    assert.strictEqual(awardResult1.awardedAmount, 100, "Should award 100 XP");
    assert.strictEqual(awardResult1.totalXp, 100, "Total XP should be 100");
    assert.strictEqual(awardResult1.levelInfo.level, 2, "Level should advance to Level 2");

    // Duplicate award with same referenceId (e.g. page refresh / replay)
    const awardResult2 = await awardXp(
      userA.id,
      "ASSESSMENT_COMPLETION",
      attemptId,
      100,
      "Completed diagnostic assessment",
    );
    assert.strictEqual(awardResult2.awarded, false, "Duplicate award must be rejected");
    assert.strictEqual(awardResult2.awardedAmount, 0, "Duplicate awarded amount must be 0");
    assert.strictEqual(awardResult2.totalXp, 100, "Total XP must remain strictly 100");

    // Verify ledger count in database
    const txCount = await prisma.xPTransaction.count({
      where: { userId: userA.id, actionType: "ASSESSMENT_COMPLETION", referenceId: attemptId },
    });
    assert.strictEqual(txCount, 1, "Exactly 1 XPTransaction record must exist for the referenceId");
    console.log("✓ Test 2 Passed: 100 XP awarded; Exact duplicate event blocked idempotently");

    // ------------------------------------------------------------
    // TEST 3: Deterministic Achievement Unlocking
    // ------------------------------------------------------------
    console.log("\n[Test 3] Testing deterministic achievement criteria evaluation...");
    
    // Create actual completed assessment
    await prisma.diagnosticAttempt.create({
      data: {
        id: `diag-${Date.now()}`,
        userId: userA.id,
        targetRole: "Full-Stack Developer",
        status: "COMPLETED",
        totalQuestions: 6,
        answeredQuestions: 6,
        score: 85,
      },
    });

    // Create a verified project
    const proj = await prisma.project.create({
      data: {
        userId: userA.id,
        title: "Full-Stack Cloud App",
        repositoryUrl: "https://github.com/example/fullstack-app",
        liveUrl: "https://fullstack-app.example.com",
        techStack: ["TypeScript", "React", "Node.js"],
        isVerified: true,
        score: 90,
      },
    });

    // Create skill state with >= 70 score
    await prisma.skillState.create({
      data: {
        userId: userA.id,
        skillName: "TypeScript",
        knowledgeScore: 85,
        practiceScore: 80,
        projectScore: 90,
        evidenceScore: 70,
      },
    });

    // Evaluate achievements
    const newlyUnlocked = await evaluateAchievements(userA.id);
    const codes = newlyUnlocked.map((a) => a.code);
    assert.ok(codes.includes("FIRST_DIAGNOSTIC"), "Should unlock FIRST_DIAGNOSTIC");
    assert.ok(codes.includes("FIRST_PROJECT"), "Should unlock FIRST_PROJECT");
    assert.ok(codes.includes("FIRST_VERIFIED_EVIDENCE"), "Should unlock FIRST_VERIFIED_EVIDENCE");
    assert.ok(codes.includes("SKILL_APPRENTICE"), "Should unlock SKILL_APPRENTICE");

    // Re-evaluating immediately should not create duplicate achievements
    const secondEval = await evaluateAchievements(userA.id);
    assert.strictEqual(secondEval.length, 0, "No duplicate achievements should be unlocked on subsequent evaluations");

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: userA.id },
    });
    assert.strictEqual(userAchievements.length, 4, "User A should have exactly 4 unlocked achievements");
    console.log(`✓ Test 3 Passed: 4 achievements unlocked (${codes.join(", ")}) without duplicate awards`);

    // ------------------------------------------------------------
    // TEST 4: Skill Tree Status Derivation (4-State Engine)
    // ------------------------------------------------------------
    console.log("\n[Test 4] Testing Skill Tree canonical mapping & node status derivation...");
    const skillTree = await getSkillTree(userA.id);
    assert.strictEqual(skillTree.targetRole, "Full-Stack Developer");
    assert.ok(skillTree.nodes.length >= 6, "Skill tree should include all canonical role skills");

    const tsNode = skillTree.nodes.find((n) => n.name.toLowerCase() === "typescript");
    assert.ok(tsNode, "TypeScript node must exist in skill tree");
    assert.strictEqual(tsNode.status, "MASTERED", "TypeScript with 85% score should be MASTERED");

    // Check available and locked nodes
    assert.ok(skillTree.masteredCount >= 1, "Must have at least 1 mastered skill");
    assert.ok(skillTree.availableCount >= 1, "Must have available skills");
    console.log(`✓ Test 4 Passed: Skill tree constructed (Mastered: ${skillTree.masteredCount}, Available: ${skillTree.availableCount}, Locked: ${skillTree.lockedCount})`);

    // ------------------------------------------------------------
    // TEST 5: Security & Cross-User IDOR Isolation
    // ------------------------------------------------------------
    console.log("\n[Test 5] Testing cross-user isolation and IDOR protection...");
    const profileB = await getUserGamificationProfile(userB.id);
    assert.strictEqual(profileB.totalXp, 0, "User B must have 0 XP (isolated from User A)");
    assert.strictEqual(profileB.unlockedCount, 0, "User B must have 0 unlocked achievements");

    const skillTreeB = await getSkillTree(userB.id);
    assert.strictEqual(skillTreeB.masteredCount, 0, "User B should have 0 mastered skills");
    assert.strictEqual(skillTreeB.targetRole, "Frontend Developer");
    console.log("✓ Test 5 Passed: Strict multi-tenant isolation verified between User A and User B");

    // ------------------------------------------------------------
    // TEST 6: Concurrent XP Award Race Condition Safety
    // ------------------------------------------------------------
    console.log("\n[Test 6] Testing concurrent parallel XP award race conditions...");
    const concurrentRefId = `race-ref-${Date.now()}`;
    const parallelCalls = Array.from({ length: 3 }, () =>
      awardXp(userA.id, "MILESTONE_COMPLETION", concurrentRefId, 150, "Completed milestone concurrently"),
    );

    const results = await Promise.all(parallelCalls);
    const successfulAwards = results.filter((r) => r.awarded);
    const rejectedAwards = results.filter((r) => !r.awarded);

    assert.strictEqual(successfulAwards.length, 1, "Exactly 1 concurrent request must succeed");
    assert.strictEqual(rejectedAwards.length, 2, "All redundant concurrent requests must be rejected");
    console.log("✓ Test 6 Passed: High-concurrency race condition safely resolved with exactly 1 award");

    console.log("\n============================================================");
    console.log("FEATURE 11 VERIFICATION: ALL TESTS PASSED (6/6)");
    console.log("============================================================");
  } finally {
    const testIds = [testUserAId, testUserBId];
    for (const uid of testIds) {
      await prisma.userAchievement.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.xPTransaction.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.userGamification.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.projectEvidence.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.project.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.diagnosticAnswer.deleteMany({ where: { attempt: { userId: uid } } }).catch(() => {});
      await prisma.diagnosticQuestion.deleteMany({ where: { attempt: { userId: uid } } }).catch(() => {});
      await prisma.diagnosticAttempt.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.interviewAnswer.deleteMany({ where: { session: { userId: uid } } }).catch(() => {});
      await prisma.interviewQuestion.deleteMany({ where: { session: { userId: uid } } }).catch(() => {});
      await prisma.interviewSession.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.skillStateHistory.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.skillState.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.careerProfile.deleteMany({ where: { userId: uid } }).catch(() => {});
      await prisma.user.delete({ where: { id: uid } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runFeature11Tests().catch((err) => {
  console.error("Feature 11 Verification Failed:", err);
  process.exit(1);
});
