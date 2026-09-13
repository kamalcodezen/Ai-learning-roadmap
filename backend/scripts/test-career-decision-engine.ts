import assert from "node:assert";
import prisma from "../src/lib/prisma.js";
import { getCareerDecision } from "../src/modules/learner/career-intelligence/services/career-decision-engine.service.js";
import { getSkillEvidenceVerification } from "../src/modules/learner/career-intelligence/services/skill-evidence-verifier.service.js";

async function runCareerDecisionEngineTests() {
  console.log("============================================================");
  console.log("STEP 7: AI CAREER DECISION ENGINE AUDIT & SCENARIO TESTS");
  console.log("============================================================");

  const timestamp = Date.now();
  const testUsers: string[] = [];

  try {
    // ------------------------------------------------------------
    // SCENARIO A: Low skills + low readiness -> NOT_READY
    // ------------------------------------------------------------
    console.log("\n[Scenario A] Testing Low skills + Low readiness -> NOT_READY...");
    const userAId = `cde-usrA-${timestamp}`;
    testUsers.push(userAId);

    await prisma.user.create({
      data: {
        id: userAId,
        name: "Scenario A Learner",
        email: `scenA-${timestamp}@example.com`,
        emailVerified: true,
        role: "LEARNER",
        careerProfile: {
          create: {
            targetRole: "fullstack",
            targetRoleName: "Full Stack Developer",
            experienceLevel: "BEGINNER",
            weeklyAvailableHours: 10,
          },
        },
      },
    });

    await prisma.skillState.createMany({
      data: [
        { userId: userAId, skillName: "Node.js", knowledgeScore: 15, practiceScore: 0, projectScore: 0, evidenceScore: 0 },
        { userId: userAId, skillName: "SQL", knowledgeScore: 20, practiceScore: 0, projectScore: 0, evidenceScore: 0 },
      ],
    });

    const decisionA = await getCareerDecision(userAId);
    console.log(`  Decision: ${decisionA.decision} (Priority: ${decisionA.priority})`);
    console.log(`  Action: ${decisionA.nextBestAction.type} - "${decisionA.nextBestAction.title}"`);
    console.log(`  Why: ${decisionA.why.join(" | ")}`);
    assert.strictEqual(decisionA.decision, "NOT_READY");
    assert.ok(["LEARN_SKILL", "TAKE_DIAGNOSTIC"].includes(decisionA.nextBestAction.type));
    console.log("✓ Scenario A Passed: Returns NOT_READY with fundamental skill gap recommendation.");

    // ------------------------------------------------------------
    // SCENARIO B: Good skills + weak proof -> BUILD_MORE_EVIDENCE
    // ------------------------------------------------------------
    console.log("\n[Scenario B] Testing Good skills + Weak proof -> BUILD_MORE_EVIDENCE...");
    const userBId = `cde-usrB-${timestamp}`;
    testUsers.push(userBId);

    await prisma.user.create({
      data: {
        id: userBId,
        name: "Scenario B Learner",
        email: `scenB-${timestamp}@example.com`,
        emailVerified: true,
        role: "LEARNER",
        careerProfile: {
          create: {
            targetRole: "fullstack",
            targetRoleName: "Full Stack Developer",
            experienceLevel: "INTERMEDIATE",
            weeklyAvailableHours: 15,
          },
        },
      },
    });

    await prisma.skillState.createMany({
      data: [
        { userId: userBId, skillName: "React", knowledgeScore: 85, practiceScore: 70, projectScore: 10, evidenceScore: 10 },
        { userId: userBId, skillName: "TypeScript", knowledgeScore: 80, practiceScore: 65, projectScore: 10, evidenceScore: 10 },
      ],
    });

    await prisma.diagnosticAttempt.create({
      data: {
        userId: userBId,
        targetRole: "fullstack",
        status: "COMPLETED",
        score: 80,
        completedAt: new Date(),
      },
    });

    const decisionB = await getCareerDecision(userBId);
    console.log(`  Decision: ${decisionB.decision} (Priority: ${decisionB.priority})`);
    console.log(`  Action: ${decisionB.nextBestAction.type} - "${decisionB.nextBestAction.title}"`);
    console.log(`  Why: ${decisionB.why.join(" | ")}`);
    assert.strictEqual(decisionB.decision, "BUILD_MORE_EVIDENCE");
    assert.strictEqual(decisionB.nextBestAction.type, "BUILD_PROJECT");
    console.log("✓ Scenario B Passed: Returns BUILD_MORE_EVIDENCE with BUILD_PROJECT recommendation.");

    // ------------------------------------------------------------
    // SCENARIO C: Moderate skills + Moderate readiness -> PREPARE_THEN_APPLY
    // ------------------------------------------------------------
    console.log("\n[Scenario C] Testing Moderate skills + Moderate readiness -> PREPARE_THEN_APPLY...");
    const userCId = `cde-usrC-${timestamp}`;
    testUsers.push(userCId);

    await prisma.user.create({
      data: {
        id: userCId,
        name: "Scenario C Learner",
        email: `scenC-${timestamp}@example.com`,
        emailVerified: true,
        role: "LEARNER",
        careerProfile: {
          create: {
            targetRole: "fullstack",
            targetRoleName: "Full Stack Developer",
            experienceLevel: "INTERMEDIATE",
            weeklyAvailableHours: 20,
          },
        },
      },
    });

    await prisma.skillState.createMany({
      data: [
        { userId: userCId, skillName: "Node.js", knowledgeScore: 70, practiceScore: 65, projectScore: 60, evidenceScore: 50 },
        { userId: userCId, skillName: "PostgreSQL", knowledgeScore: 65, practiceScore: 60, projectScore: 55, evidenceScore: 45 },
      ],
    });

    const projectC = await prisma.project.create({
      data: {
        userId: userCId,
        title: "API Gateway",
        description: "Node.js and Postgres backend",
        techStack: ["Node.js", "PostgreSQL"],
        isVerified: true,
        score: 75,
      },
    });

    await prisma.projectEvidence.createMany({
      data: [
        {
          userId: userCId,
          projectId: projectC.id,
          skillName: "Node.js",
          evidenceType: "GITHUB",
          url: "https://github.com/test/gateway",
        },
        {
          userId: userCId,
          projectId: projectC.id,
          skillName: "PostgreSQL",
          evidenceType: "GITHUB",
          url: "https://github.com/test/gateway-db",
        },
      ],
    });

    await prisma.diagnosticAttempt.create({
      data: {
        userId: userCId,
        targetRole: "fullstack",
        status: "COMPLETED",
        score: 70,
        completedAt: new Date(),
      },
    });

    const decisionC = await getCareerDecision(userCId);
    console.log(`  Decision: ${decisionC.decision} (Confidence: ${decisionC.employerConfidenceSignal}%, Readiness: ${decisionC.readinessScore}%)`);
    console.log(`  Action: ${decisionC.nextBestAction.type} - "${decisionC.nextBestAction.title}"`);
    assert.strictEqual(decisionC.decision, "PREPARE_THEN_APPLY");
    console.log("✓ Scenario C Passed: Returns PREPARE_THEN_APPLY with targeted preparation action.");

    // ------------------------------------------------------------
    // SCENARIO D: Strong skills + Strong proof + Strong readiness -> APPLY_NOW
    // ------------------------------------------------------------
    console.log("\n[Scenario D] Testing Strong skills + Strong proof + Strong readiness -> APPLY_NOW...");
    const userDId = `cde-usrD-${timestamp}`;
    testUsers.push(userDId);

    await prisma.user.create({
      data: {
        id: userDId,
        name: "Scenario D Learner",
        email: `scenD-${timestamp}@example.com`,
        emailVerified: true,
        role: "LEARNER",
        careerProfile: {
          create: {
            targetRole: "fullstack",
            targetRoleName: "Full Stack Developer",
            experienceLevel: "INTERMEDIATE",
            weeklyAvailableHours: 25,
            interviewScore: 85,
          },
        },
      },
    });

    await prisma.skillState.createMany({
      data: [
        { userId: userDId, skillName: "Node.js", knowledgeScore: 90, practiceScore: 85, projectScore: 85, evidenceScore: 80 },
        { userId: userDId, skillName: "React", knowledgeScore: 88, practiceScore: 85, projectScore: 80, evidenceScore: 80 },
      ],
    });

    const projectD = await prisma.project.create({
      data: {
        userId: userDId,
        title: "Enterprise Dashboard",
        description: "Full-stack application",
        techStack: ["Node.js", "React"],
        isVerified: true,
        score: 92,
      },
    });

    await prisma.projectEvidence.createMany({
      data: [
        { userId: userDId, projectId: projectD.id, skillName: "Node.js", evidenceType: "GITHUB", url: "https://github.com/test/ent-node" },
        { userId: userDId, projectId: projectD.id, skillName: "React", evidenceType: "LIVE_URL", url: "https://ent.example.com" },
      ],
    });

    const diagD = await prisma.diagnosticAttempt.create({
      data: {
        userId: userDId,
        targetRole: "fullstack",
        status: "COMPLETED",
        score: 90,
        completedAt: new Date(),
      },
    });

    // Create diagnostic answers to fulfill Q4 problem solving and Q6 communication
    const q4 = await prisma.diagnosticQuestion.findFirst({ where: { order: 4 } });
    const q6 = await prisma.diagnosticQuestion.findFirst({ where: { order: 6 } });
    if (q4 && q6) {
      await prisma.diagnosticAnswer.createMany({
        data: [
          { attemptId: diagD.id, questionId: q4.id, selectedAnswer: "ans", isCorrect: true },
          { attemptId: diagD.id, questionId: q6.id, selectedAnswer: "comm", isCorrect: true, evaluation: { score: 85 } },
        ],
      });
    }

    await prisma.interviewSession.create({
      data: {
        userId: userDId,
        targetRole: "Full Stack Developer",
        status: "COMPLETED",
        score: 85,
      },
    });

    const decisionD = await getCareerDecision(userDId);
    console.log(`  Decision: ${decisionD.decision} (Confidence: ${decisionD.employerConfidenceSignal}%, Readiness: ${decisionD.readinessScore}%)`);
    console.log(`  Action: ${decisionD.nextBestAction.type} - "${decisionD.nextBestAction.title}"`);
    assert.strictEqual(decisionD.decision, "APPLY_NOW");
    assert.strictEqual(decisionD.nextBestAction.type, "APPLY_NOW");
    console.log("✓ Scenario D Passed: Returns APPLY_NOW with active application recommendation.");

    // ------------------------------------------------------------
    // SCENARIO E: Strong skills + Strong proof + Weak interview -> PREPARE_THEN_APPLY / PRACTICE_INTERVIEW
    // ------------------------------------------------------------
    console.log("\n[Scenario E] Testing Strong skills + Weak interview -> PREPARE_THEN_APPLY with PRACTICE_INTERVIEW...");
    const userEId = `cde-usrE-${timestamp}`;
    testUsers.push(userEId);

    await prisma.user.create({
      data: {
        id: userEId,
        name: "Scenario E Learner",
        email: `scenE-${timestamp}@example.com`,
        emailVerified: true,
        role: "LEARNER",
        careerProfile: {
          create: {
            targetRole: "fullstack",
            targetRoleName: "Full Stack Developer",
            experienceLevel: "INTERMEDIATE",
            weeklyAvailableHours: 20,
          },
        },
      },
    });

    await prisma.skillState.createMany({
      data: [
        { userId: userEId, skillName: "Node.js", knowledgeScore: 85, practiceScore: 80, projectScore: 80, evidenceScore: 75 },
      ],
    });

    const projectE = await prisma.project.create({
      data: {
        userId: userEId,
        title: "Verified Backend",
        description: "Node.js service",
        techStack: ["Node.js"],
        isVerified: true,
        score: 85,
      },
    });

    await prisma.projectEvidence.create({
      data: {
        userId: userEId,
        projectId: projectE.id,
        skillName: "Node.js",
        evidenceType: "GITHUB",
        url: "https://github.com/test/node-service",
      },
    });

    await prisma.diagnosticAttempt.create({
      data: {
        userId: userEId,
        targetRole: "fullstack",
        status: "COMPLETED",
        score: 80,
        completedAt: new Date(),
      },
    });

    // Failing mock interview
    await prisma.interviewSession.create({
      data: {
        userId: userEId,
        targetRole: "Full Stack Developer",
        status: "COMPLETED",
        score: 42,
      },
    });

    const decisionE = await getCareerDecision(userEId);
    console.log(`  Decision: ${decisionE.decision} (Interview: 42%)`);
    console.log(`  Action: ${decisionE.nextBestAction.type} - "${decisionE.nextBestAction.title}"`);
    console.log(`  Why: ${decisionE.why.join(" | ")}`);
    assert.strictEqual(decisionE.decision, "PREPARE_THEN_APPLY");
    assert.strictEqual(decisionE.nextBestAction.type, "PRACTICE_INTERVIEW");
    assert.ok(decisionE.why.some((w) => w.includes("interview") || w.includes("Interview")));
    console.log("✓ Scenario E Passed: Weak interview directs learner to PREPARE_THEN_APPLY and PRACTICE_INTERVIEW.");

    // ------------------------------------------------------------
    // SCENARIO F: Data Mutation Test (Dynamic Reaction)
    // ------------------------------------------------------------
    console.log("\n[Scenario F] Testing dynamic data mutation reaction...");
    const decisionBefore = await getCareerDecision(userAId);
    assert.strictEqual(decisionBefore.decision, "NOT_READY");

    // Mutate User A's skill to high score and add diagnostic
    await prisma.skillState.updateMany({
      where: { userId: userAId },
      data: { knowledgeScore: 85, practiceScore: 75 },
    });
    await prisma.diagnosticAttempt.create({
      data: {
        userId: userAId,
        targetRole: "fullstack",
        status: "COMPLETED",
        score: 85,
        completedAt: new Date(),
      },
    });

    const decisionAfter = await getCareerDecision(userAId);
    console.log(`  Before Mutation Decision: ${decisionBefore.decision}`);
    console.log(`  After Mutation Decision:  ${decisionAfter.decision} (${decisionAfter.nextBestAction.title})`);
    assert.notStrictEqual(decisionBefore.decision, decisionAfter.decision);
    assert.strictEqual(decisionAfter.decision, "BUILD_MORE_EVIDENCE");
    console.log("✓ Scenario F Passed: Decision engine reacts dynamically to persisted data changes!");

    console.log("\n============================================================");
    console.log("AI CAREER DECISION ENGINE: ALL 6 SCENARIOS PASSED (6/6)");
    console.log("============================================================");
  } catch (err) {
    console.error("❌ Scenario Test Failed:", err);
    process.exit(1);
  } finally {
    if (testUsers.length > 0) {
      console.log("\nCleaning up test users...");
      await prisma.user.deleteMany({ where: { id: { in: testUsers } } });
      console.log("Cleanup completed.");
    }
  }
}

runCareerDecisionEngineTests();
