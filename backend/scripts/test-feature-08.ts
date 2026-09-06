import assert from "node:assert";
import prisma from "../src/lib/prisma.js";
import { getCareerAlignment } from "../src/modules/learner/career-alignment/services/career-alignment.service.js";
import {
  getLearnerJobReality,
  clearMarketCache,
  getMarketCacheEntry,
  setMarketCacheEntry,
  CACHE_TTL_MS
} from "../src/modules/learner/job-reality/job-reality.service.js";

async function runFeature08Tests() {
  console.log("============================================================");
  console.log("FEATURE 08 — CAREER & JOB-MARKET ALIGNMENT VERIFICATION");
  console.log("============================================================");

  const testUserId = `f08-usr-${Date.now()}`;
  let testUser: any = null;

  try {
    testUser = await prisma.user.create({
      data: {
        id: testUserId,
        name: "Career Alignment Tester",
        email: `f08-${Date.now()}@example.com`,
        emailVerified: true,
        role: "LEARNER",
      }
    });

    // ------------------------------------------------------------
    // TEST 1: Missing Target Role Handling
    // ------------------------------------------------------------
    console.log("\n[Test 1] Testing missing career profile / onboarding handling...");
    const missingProfileRes = await getCareerAlignment(testUser.id);
    assert.strictEqual(missingProfileRes.targetRole, "NO_TARGET_ROLE");
    assert.strictEqual(missingProfileRes.matchPercentage, 0);
    assert.strictEqual(missingProfileRes.href, "/onboarding");

    let jobRealityError = false;
    try {
      await getLearnerJobReality(testUser.id);
    } catch (err: any) {
      if (err.message.includes("No target role defined")) {
        jobRealityError = true;
      }
    }
    assert.strictEqual(jobRealityError, true, "Job reality must throw if onboarding is not completed");
    console.log("✓ Test 1 Passed: Missing target role redirects to onboarding properly");

    // Setup profile for Full Stack Developer
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

    await prisma.milestone.create({
      data: {
        roadmapId: roadmap.id,
        order: 1,
        title: "Full Stack Foundations",
        description: "JavaScript, TypeScript, and React mastery",
        status: "CURRENT",
        unlocks: ["JavaScript", "TypeScript", "React"],
      }
    });

    // Seed initial skills
    await prisma.skillState.createMany({
      data: [
        { userId: testUser.id, skillName: "JavaScript", knowledgeScore: 85, practiceScore: 80, projectScore: 70, evidenceScore: 60 },
        { userId: testUser.id, skillName: "TypeScript", knowledgeScore: 45, practiceScore: 30, projectScore: 0, evidenceScore: 0 },
      ]
    });

    // ------------------------------------------------------------
    // TEST 2: Career Alignment Calculation & Categorization
    // ------------------------------------------------------------
    console.log("\n[Test 2] Testing Career Alignment match calculation and skill categorization...");
    const alignment1 = await getCareerAlignment(testUser.id);

    assert.strictEqual(alignment1.targetRole, "Full Stack Developer");
    assert.ok(alignment1.matchPercentage > 0 && alignment1.matchPercentage < 100, "Match percentage must be calculated");
    assert.ok(alignment1.strongSkills.includes("JavaScript"), "JavaScript must be in strong skills");
    assert.ok(alignment1.developingSkills.includes("TypeScript"), "TypeScript must be in developing skills");
    assert.ok(alignment1.missingSkills.length > 0, "Missing required skills must be identified");
    assert.ok(alignment1.criticalGaps.length > 0, "Critical required gaps must be flagged");
    console.log(`✓ Test 2 Passed: Career match is ${alignment1.matchPercentage}% with ${alignment1.strongSkills.length} strong, ${alignment1.developingSkills.length} developing, and ${alignment1.criticalGaps.length} critical gaps`);

    // ------------------------------------------------------------
    // TEST 3: Dynamic Skill State Updates Affect Match Score
    // ------------------------------------------------------------
    console.log("\n[Test 3] Verifying match score increases when skills improve...");
    await prisma.skillState.update({
      where: { userId_skillName: { userId: testUser.id, skillName: "TypeScript" } },
      data: { knowledgeScore: 90, practiceScore: 85, projectScore: 80, evidenceScore: 70 }
    });

    await prisma.skillState.create({
      data: {
        userId: testUser.id,
        skillName: "React",
        knowledgeScore: 85,
        practiceScore: 80,
        projectScore: 75,
        evidenceScore: 60
      }
    });

    const alignment2 = await getCareerAlignment(testUser.id);
    assert.ok(alignment2.matchPercentage > alignment1.matchPercentage, "Match percentage must increase as skills improve");
    assert.ok(alignment2.strongSkills.includes("TypeScript"), "TypeScript should now be categorized as strong");
    console.log(`✓ Test 3 Passed: Match percentage dynamically increased from ${alignment1.matchPercentage}% to ${alignment2.matchPercentage}%`);

    // ------------------------------------------------------------
    // TEST 4: Job Reality Market Data & Demand Analysis
    // ------------------------------------------------------------
    console.log("\n[Test 4] Testing Job Reality market demand analysis...");
    clearMarketCache();

    const jobReality = await getLearnerJobReality(testUser.id);
    assert.ok(jobReality, "Job reality data should be returned");
    assert.strictEqual(jobReality.targetRole, "Full Stack Developer");
    assert.ok(Array.isArray(jobReality.skills), "Skills comparison list must be returned");
    assert.ok(jobReality.skills.length > 0, "Skills list must contain required skills");
    assert.ok(jobReality.source, "Source attribution must be present");
    assert.ok(typeof jobReality.source.provider === "string", "Provider name must be present");
    console.log(`✓ Test 4 Passed: Market reality analyzed ${jobReality.skills.length} skills (Provider: ${jobReality.source.provider})`);

    // ------------------------------------------------------------
    // TEST 5: Job Reality In-Memory Caching
    // ------------------------------------------------------------
    console.log("\n[Test 5] Testing market data caching...");
    const cachedEntry = getMarketCacheEntry("Full Stack Developer");
    assert.ok(cachedEntry, "Market query must be cached in memory");

    const cachedCall = await getLearnerJobReality(testUser.id);
    assert.strictEqual(cachedCall.source.cached, true, "Second call must hit the market cache");
    console.log("✓ Test 5 Passed: Market data caching verified");

    // ------------------------------------------------------------
    // TEST 6: Changing Target Role Dynamically
    // ------------------------------------------------------------
    console.log("\n[Test 6] Testing target role switch (Full Stack -> DevOps)...");
    await prisma.careerProfile.update({
      where: { userId: testUser.id },
      data: {
        targetRole: "DEVOPS_ENGINEER",
        targetRoleName: "DevOps Engineer"
      }
    });

    const devopsAlignment = await getCareerAlignment(testUser.id);
    assert.strictEqual(devopsAlignment.targetRole, "DevOps Engineer");
    const hasDockerOrLinux = devopsAlignment.requirements.some((r: any) => ["Docker", "Linux", "Kubernetes", "CI/CD"].includes(r.skill));
    assert.ok(hasDockerOrLinux, "DevOps requirements must reflect canonical DevOps skills");
    console.log(`✓ Test 6 Passed: Role switch recalculated alignment for "${devopsAlignment.targetRole}"`);

    console.log("\n============================================================");
    console.log("FEATURE 08 VERIFICATION: ALL TESTS PASSED (6/6)");
    console.log("============================================================");
  } finally {
    clearMarketCache();
    if (testUser?.id) {
      await prisma.projectEvidence.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.project.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.milestone.deleteMany({ where: { roadmap: { userId: testUser.id } } }).catch(() => {});
      await prisma.roadmap.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.skillState.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.careerProfile.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runFeature08Tests().catch((err) => {
  console.error("Feature 08 Verification Failed:", err);
  process.exit(1);
});
