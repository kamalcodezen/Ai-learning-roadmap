import assert from "node:assert";
import prisma from "../src/lib/prisma.js";
import { getCareerDecision } from "../src/modules/learner/career-intelligence/services/career-decision-engine.service.js";
import { getSkillEvidenceVerification } from "../src/modules/learner/career-intelligence/services/skill-evidence-verifier.service.js";

async function runCareerIntelligenceTests() {
  console.log("============================================================");
  console.log("FEATURE: CAREER INTELLIGENCE & EVIDENCE VERIFICATION TESTS");
  console.log("============================================================");

  const testUserAId = `ci-usrA-${Date.now()}`;
  const testUserBId = `ci-usrB-${Date.now()}`;

  try {
    // SEED TEST USER A (Clean slate user)
    const userA = await prisma.user.create({
      data: {
        id: testUserAId,
        name: "Career Intelligence Tester A",
        email: `ci-a-${Date.now()}@example.com`,
        emailVerified: true,
        role: "LEARNER",
        careerProfile: {
          create: {
            targetRole: "Full-Stack Engineer",
            targetRoleName: "Full-Stack Engineer",
            experienceLevel: "INTERMEDIATE",
            weeklyAvailableHours: 15,
          },
        },
      },
    });

    // SEED TEST USER B (Experienced User with skills and projects)
    const userB = await prisma.user.create({
      data: {
        id: testUserBId,
        name: "Career Intelligence Tester B",
        email: `ci-b-${Date.now()}@example.com`,
        emailVerified: true,
        role: "LEARNER",
        careerProfile: {
          create: {
            targetRole: "Backend Engineer",
            targetRoleName: "Backend Engineer",
            experienceLevel: "INTERMEDIATE",
            weeklyAvailableHours: 20,
          },
        },
      },
    });

    await prisma.skillState.createMany({
      data: [
        {
          userId: userB.id,
          skillName: "Node.js",
          knowledgeScore: 85,
          practiceScore: 80,
          projectScore: 75,
          evidenceScore: 70,
        },
        {
          userId: userB.id,
          skillName: "PostgreSQL",
          knowledgeScore: 75,
          practiceScore: 70,
          projectScore: 60,
          evidenceScore: 50,
        },
      ],
    });

    const projectB = await prisma.project.create({
      data: {
        userId: userB.id,
        title: "API Microservice",
        description: "Production Node.js API",
        techStack: ["Node.js", "PostgreSQL"],
        isVerified: true,
        score: 88,
      },
    });

    await prisma.projectEvidence.create({
      data: {
        userId: userB.id,
        projectId: projectB.id,
        skillName: "Node.js",
        evidenceType: "GITHUB",
        url: "https://github.com/test/api-microservice",
      },
    });

    // ------------------------------------------------------------
    // TEST 1: User A Clean State (No Data)
    // ------------------------------------------------------------
    console.log("\n[Test 1] Testing clean learner empty state for Decision Engine & Evidence Verifier...");
    const verifA = await getSkillEvidenceVerification(userA.id);
    assert.strictEqual(verifA.overallSkillScore, 0);
    assert.strictEqual(verifA.overallProofScore, 0);
    assert.strictEqual(verifA.skills.length, 0);

    const decisionA = await getCareerDecision(userA.id);
    assert.strictEqual(decisionA.decision, "NOT_READY");
    assert.strictEqual(decisionA.nextBestAction.type, "TAKE_DIAGNOSTIC");
    assert.ok(decisionA.why.length > 0);
    console.log("✓ Test 1 Passed: Clean empty state handled gracefully with diagnostic recommendation");

    // ------------------------------------------------------------
    // TEST 2: User B High Competence with Verified Evidence
    // ------------------------------------------------------------
    console.log("\n[Test 2] Testing learner with verified skills and project evidence...");
    const verifB = await getSkillEvidenceVerification(userB.id);
    assert.ok(verifB.overallSkillScore > 70, "Skill score should reflect skill states");
    assert.ok(verifB.overallProofScore > 0, "Proof score should reflect verified project evidence");
    const nodejsSkill = verifB.skills.find((s) => s.skillName === "Node.js");
    assert.ok(nodejsSkill, "Node.js skill should exist in verification list");
    assert.strictEqual(nodejsSkill.evidenceSources.verifiedProjectsCount, 1);

    const decisionB = await getCareerDecision(userB.id);
    assert.ok(decisionB.employerConfidenceSignal > 30, "Employer confidence signal should be computed");
    assert.ok(decisionB.simulation.projectedProofScoreGain > 0, "What-If simulation should calculate gains");
    console.log(`✓ Test 2 Passed: Evidence verifier & decision engine computed real data metrics (Confidence: ${decisionB.employerConfidenceSignal}%)`);

    // ------------------------------------------------------------
    // TEST 3: Cleanup Test Data
    // ------------------------------------------------------------
    console.log("\n[Test 3] Cleaning up test user records...");
    await prisma.user.deleteMany({
      where: { id: { in: [userA.id, userB.id] } },
    });
    console.log("✓ Test 3 Passed: Test user records cleaned up cleanly");

    console.log("\n============================================================");
    console.log("CAREER INTELLIGENCE VERIFICATION: ALL TESTS PASSED (3/3)");
    console.log("============================================================");
  } catch (error) {
    console.error("❌ Test Failed:", error);
    process.exit(1);
  }
}

runCareerIntelligenceTests();
