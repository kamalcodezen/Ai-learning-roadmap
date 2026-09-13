import assert from "node:assert";
import prisma from "../src/lib/prisma.js";
import {
  createProject,
  updateProject,
  deleteProject,
  getPortfolio,
  generateMilestoneProject,
  generateProjectReview,
  verifyProjectUrls,
  syncProjectEvidence
} from "../src/modules/learner/projects/services/portfolio.service.js";

async function runFeature04Tests() {
  console.log("============================================================");
  console.log("FEATURE 04 — PROJECT-BASED MILESTONE GENERATOR VERIFICATION");
  console.log("============================================================");

  const testEmail = `f04-test-${Date.now()}@example.com`;
  let testUser: any = null;

  try {
    // Setup test user with profile, roadmap, milestone and initial skill state
    testUser = await prisma.user.create({
      data: {
        id: `f04-usr-${Date.now()}`,
        name: "Feature 04 Tester",
        email: testEmail,
        emailVerified: true,
        role: "LEARNER",
      }
    });

    await prisma.careerProfile.create({
      data: {
        userId: testUser.id,
        targetRole: "FULL_STACK_ENGINEER",
        targetRoleName: "Full Stack Engineer",
        experienceLevel: "BEGINNER",
        weeklyAvailableHours: 15,
        onboardingCompleted: true,
      }
    });

    const roadmap = await prisma.roadmap.create({
      data: {
        userId: testUser.id,
        targetRole: "Full Stack Engineer",
        status: "ACTIVE",
      }
    });

    const milestone = await prisma.milestone.create({
      data: {
        roadmapId: roadmap.id,
        order: 1,
        title: "REST APIs and Full-Stack Integration",
        description: "Design and implement RESTful API architecture with Prisma and PostgreSQL",
        status: "CURRENT",
        unlocks: ["REST APIs", "Node.js", "PostgreSQL"],
      }
    });

    // Seed an initial SkillState with knowledgeScore=50 to test preservation
    await prisma.skillState.create({
      data: {
        userId: testUser.id,
        skillName: "Node.js",
        knowledgeScore: 50,
        practiceScore: 25,
        projectScore: 0,
        evidenceScore: 0,
      }
    });

    // ------------------------------------------------------------
    // TEST 1: Milestone Project Generation
    // ------------------------------------------------------------
    console.log("\n[Test 1] Generating milestone project derived from milestone unlocks...");
    const milestoneProject = await generateMilestoneProject(testUser.id, milestone.id);

    assert.ok(milestoneProject, "Milestone project should be created");
    assert.strictEqual(milestoneProject.userId, testUser.id, "Project should belong to test user");
    assert.ok(milestoneProject.title.length > 0, "Project title should be populated");
    assert.ok(milestoneProject.description && milestoneProject.description.length > 0, "Project description should be populated");
    assert.ok(Array.isArray(milestoneProject.techStack) && milestoneProject.techStack.length > 0, "Project techStack should be populated");
    assert.strictEqual(milestoneProject.isVerified, false, "Fresh milestone project is not verified by default");
    console.log(`✓ Test 1 Passed: Milestone project created: "${milestoneProject.title}" with stack [${milestoneProject.techStack.join(", ")}]`);

    // ------------------------------------------------------------
    // TEST 2: URL Verification and SSRF Protection
    // ------------------------------------------------------------
    console.log("\n[Test 2] Testing SSRF safety and URL verification...");
    
    // Unsafe localhost / intranet URLs should be rejected
    const updateUnsafe = await updateProject(testUser.id, milestoneProject.id, {
      repositoryUrl: "http://127.0.0.1:8080/exploit",
      liveUrl: "http://169.254.169.254/latest/meta-data",
    });
    
    const verifyUnsafe = await verifyProjectUrls(testUser.id, milestoneProject.id);
    assert.strictEqual(verifyUnsafe.isVerified, false, "SSRF URLs must never verify");
    assert.strictEqual(verifyUnsafe.github.verified, false, "Internal IP repo URL must be rejected");
    assert.strictEqual(verifyUnsafe.live.verified, false, "Cloud metadata IP live URL must be rejected");
    console.log("✓ Test 2 Passed: SSRF protection blocked malicious IP and metadata URLs");

    // ------------------------------------------------------------
    // TEST 3: Multi-Factor AI Project Review Generation
    // ------------------------------------------------------------
    console.log("\n[Test 3] Generating multi-factor AI project review...");
    const review = await generateProjectReview(testUser.id, milestoneProject.id);

    assert.ok(review, "Project review should be returned");
    assert.ok(typeof review.overallScore === "number", "Review overallScore must be a number");
    assert.ok(Array.isArray(review.strengths), "Review strengths must be an array");
    assert.ok(Array.isArray(review.weaknesses), "Review weaknesses must be an array");
    assert.ok(Array.isArray(review.recommendations), "Review recommendations must be an array");
    console.log(`✓ Test 3 Passed: AI Project review generated with overallScore=${review.overallScore}/100`);

    // ------------------------------------------------------------
    // TEST 4: SkillState Deterministic Updates & KnowledgeScore Preservation
    // ------------------------------------------------------------
    console.log("\n[Test 4] Verifying SkillState integrity and score preservation...");
    const nodeJsSkill = await prisma.skillState.findUnique({
      where: { userId_skillName: { userId: testUser.id, skillName: "Node.js" } }
    });

    assert.ok(nodeJsSkill, "SkillState for Node.js must exist");
    assert.strictEqual(nodeJsSkill.knowledgeScore, 50, "knowledgeScore must remain untouched at 50");
    assert.strictEqual(nodeJsSkill.practiceScore, 25, "practiceScore must remain untouched at 25");
    assert.ok(typeof nodeJsSkill.projectScore === "number", "projectScore must be calculated");
    assert.ok(typeof nodeJsSkill.evidenceScore === "number", "evidenceScore must be calculated");
    console.log(`✓ Test 4 Passed: SkillState scores preserved (knowledge: ${nodeJsSkill.knowledgeScore}, practice: ${nodeJsSkill.practiceScore}, project: ${nodeJsSkill.projectScore}, evidence: ${nodeJsSkill.evidenceScore})`);

    // ------------------------------------------------------------
    // TEST 5: Portfolio Aggregation & Project Deletion
    // ------------------------------------------------------------
    console.log("\n[Test 5] Testing portfolio retrieval and clean project deletion...");
    const portfolio = await getPortfolio(testUser.id);
    assert.ok(portfolio, "Portfolio should be returned");
    assert.strictEqual(portfolio.projects.length, 1, "Portfolio should contain 1 project");
    assert.strictEqual(portfolio.projects[0].id, milestoneProject.id, "Project ID should match");

    const deleteRes = await deleteProject(testUser.id, milestoneProject.id);
    assert.strictEqual(deleteRes.success, true, "Project deletion should succeed");

    const portfolioAfterDelete = await getPortfolio(testUser.id);
    assert.strictEqual(portfolioAfterDelete.projects.length, 0, "Portfolio should now be empty");
    console.log("✓ Test 5 Passed: Portfolio aggregation and clean deletion verified");

    console.log("\n============================================================");
    console.log("FEATURE 04 VERIFICATION: ALL TESTS PASSED (5/5)");
    console.log("============================================================");
  } finally {
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

runFeature04Tests().catch((err) => {
  console.error("Feature 04 Verification Failed:", err);
  process.exit(1);
});
