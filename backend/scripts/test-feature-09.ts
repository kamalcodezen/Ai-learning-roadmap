import assert from "node:assert";
import prisma from "../src/lib/prisma.js";
import { getProgress } from "../src/modules/learner/progress/services/progress.service.js";

async function runFeature09Tests() {
  console.log("============================================================");
  console.log("FEATURE 09 — PROGRESS & SKILL MASTERY TRACKING VERIFICATION");
  console.log("============================================================");

  const testUserId = `f09-usr-${Date.now()}`;
  let testUser: any = null;

  try {
    testUser = await prisma.user.create({
      data: {
        id: testUserId,
        name: "Progress & Mastery Tester",
        email: `f09-${Date.now()}@example.com`,
        emailVerified: true,
        role: "LEARNER",
      }
    });

    // ------------------------------------------------------------
    // TEST 1: New Learner Empty State
    // ------------------------------------------------------------
    console.log("\n[Test 1] Testing new learner (empty telemetry state)...");
    const emptyProgress = await getProgress(testUser.id);
    assert.strictEqual(emptyProgress.weeklyHours, 0, "Weekly hours should be 0");
    assert.strictEqual(emptyProgress.monthlyHours, 0, "Monthly hours should be 0");
    assert.strictEqual(emptyProgress.currentStreak, 0, "Streak should be 0");
    assert.strictEqual(emptyProgress.readinessTrend, 0, "Readiness trend should be 0");
    assert.strictEqual(emptyProgress.recentActivity.length, 0, "Recent activity should be empty");
    console.log("✓ Test 1 Passed: Clean empty state for new learner verified");

    // ------------------------------------------------------------
    // TEST 2: Single Activity Today
    // ------------------------------------------------------------
    console.log("\n[Test 2] Testing single activity completed today...");
    const now = new Date();
    await prisma.activityLog.create({
      data: {
        userId: testUser.id,
        type: "LEARNING",
        description: "Studied TypeScript generic types handbook",
        createdAt: now,
        metadata: { durationMinutes: 45 }
      }
    });

    const singleProgress = await getProgress(testUser.id);
    assert.strictEqual(singleProgress.currentStreak, 1, "Streak should be 1 day");
    assert.strictEqual(singleProgress.weeklyHours, 0.8, "45 mins should be 0.8 hours");
    assert.strictEqual(singleProgress.monthlyHours, 0.8, "Monthly hours should match");
    assert.strictEqual(singleProgress.recentActivity.length, 1, "Recent activity should contain 1 entry");
    assert.strictEqual(singleProgress.recentActivity[0].type, "learning");
    console.log(`✓ Test 2 Passed: Single activity recorded (streak: ${singleProgress.currentStreak} day, weekly: ${singleProgress.weeklyHours}h)`);

    // ------------------------------------------------------------
    // TEST 3: 7-Day Continuous Streak
    // ------------------------------------------------------------
    console.log("\n[Test 3] Simulating 7-day continuous activity streak...");
    // Create activity for each of the past 6 consecutive days
    for (let dayOffset = 1; dayOffset <= 6; dayOffset++) {
      const pastDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      await prisma.activityLog.create({
        data: {
          userId: testUser.id,
          type: dayOffset % 2 === 0 ? "ASSESSMENT" : "PROJECT",
          description: `Completed day ${dayOffset} technical module`,
          createdAt: pastDate,
          metadata: { durationMinutes: 60 }
        }
      });
    }

    const streakProgress = await getProgress(testUser.id);
    assert.strictEqual(streakProgress.currentStreak, 7, "Streak should be exactly 7 continuous days");
    assert.ok(streakProgress.weeklyHours >= 6.0, "Weekly hours should reflect 7 days of activity");
    console.log(`✓ Test 3 Passed: 7-day continuous streak achieved (${streakProgress.currentStreak} days, ${streakProgress.weeklyHours}h this week)`);

    // ------------------------------------------------------------
    // TEST 4: Broken Streak Calculation
    // ------------------------------------------------------------
    console.log("\n[Test 4] Testing broken streak detection...");
    // Clear all recent activity and insert activity from 4 days ago only
    await prisma.activityLog.deleteMany({ where: { userId: testUser.id } });
    
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    await prisma.activityLog.create({
      data: {
        userId: testUser.id,
        type: "LEARNING",
        description: "Completed archived module 4 days ago",
        createdAt: fourDaysAgo,
        metadata: { durationMinutes: 60 }
      }
    });

    const brokenProgress = await getProgress(testUser.id);
    assert.strictEqual(brokenProgress.currentStreak, 0, "Streak must be 0 when no activity occurred today or yesterday");
    assert.strictEqual(brokenProgress.weeklyHours, 1.0, "Weekly hours should still track activity within 7 days");
    console.log("✓ Test 4 Passed: Inactive learner streak safely resets to 0 days");

    // ------------------------------------------------------------
    // TEST 5: Skill Mastery & Readiness Trend with SkillStateHistory
    // ------------------------------------------------------------
    console.log("\n[Test 5] Testing skill improvement and historical readiness trend...");
    
    // Seed initial SkillStateHistory from 10 days ago (past average: 40%)
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    await prisma.skillStateHistory.createMany({
      data: [
        { userId: testUser.id, skillName: "Node.js", knowledgeScore: 40, practiceScore: 40, projectScore: 40, evidenceScore: 0, createdAt: tenDaysAgo },
        { userId: testUser.id, skillName: "TypeScript", knowledgeScore: 40, practiceScore: 40, projectScore: 40, evidenceScore: 0, createdAt: tenDaysAgo },
      ]
    });

    // Current improved SkillState (current average: 80%)
    await prisma.skillState.createMany({
      data: [
        { userId: testUser.id, skillName: "Node.js", knowledgeScore: 80, practiceScore: 80, projectScore: 80, evidenceScore: 60 },
        { userId: testUser.id, skillName: "TypeScript", knowledgeScore: 80, practiceScore: 80, projectScore: 80, evidenceScore: 60 },
      ]
    });

    const masteryProgress = await getProgress(testUser.id);
    assert.strictEqual(masteryProgress.readinessTrend, 40, "Readiness trend should be +40% (80% current - 40% historical)");
    console.log(`✓ Test 5 Passed: Readiness trend computed deterministically (+${masteryProgress.readinessTrend}% gain)`);

    console.log("\n============================================================");
    console.log("FEATURE 09 VERIFICATION: ALL TESTS PASSED (5/5)");
    console.log("============================================================");
  } finally {
    if (testUser?.id) {
      await prisma.skillStateHistory.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.activityLog.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.skillState.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runFeature09Tests().catch((err) => {
  console.error("Feature 09 Verification Failed:", err);
  process.exit(1);
});
