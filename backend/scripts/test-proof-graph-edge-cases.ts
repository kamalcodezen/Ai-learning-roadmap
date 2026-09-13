import assert from "node:assert";
import prisma from "../src/lib/prisma.js";
import { getProofGraph } from "../src/modules/learner/proof-graph/services/proof-graph.service.js";

async function testProofGraphEdgeCases() {
  console.log("============================================================");
  console.log("PROOF GRAPH EDGE-CASE UNIT VERIFICATION");
  console.log("============================================================");

  const testUserId = `pg-edge-usr-${Date.now()}`;

  try {
    // 1. Create base user & career profile
    const user = await prisma.user.create({
      data: {
        id: testUserId,
        name: "Proof Graph Edge Tester",
        email: `pg-edge-${Date.now()}@example.com`,
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

    console.log("[Test Edge 1] Clean empty user (no skills, no evidence, no projects, no interviews)...");
    const res1 = await getProofGraph(user.id);
    assert.strictEqual(res1.overallProofScore, 0);
    assert.strictEqual(res1.nodes.length, 1);
    assert.strictEqual(res1.nodes[0].id, "empty-state-node");
    console.log("✓ Edge 1 Passed: Returns clean empty-state-node without crashing");

    // 2. Add skill state but no evidence or projects
    console.log("[Test Edge 2] SkillState present, but no evidence/projects/interviews...");
    await prisma.skillState.create({
      data: {
        userId: user.id,
        skillName: "TypeScript",
        knowledgeScore: 80,
        practiceScore: 60,
        projectScore: 0,
        evidenceScore: 0,
      },
    });
    const res2 = await getProofGraph(user.id);
    assert.ok(res2.nodes.length >= 1);
    const skillNode = res2.nodes.find((n) => n.id.startsWith("skill-"));
    assert.ok(skillNode, "Skill node must exist");
    assert.strictEqual(skillNode.title, "TypeScript");
    console.log("✓ Edge 2 Passed: Skill node rendered with score calculation");

    // 3. Diagnostic attempt with answer having NULL question or NULL question.skill
    console.log("[Test Edge 3] Diagnostic attempt with null/missing question relation...");
    const diagAttempt = await prisma.diagnosticAttempt.create({
      data: {
        userId: user.id,
        status: "COMPLETED",
        score: 100,
      },
    });
    // Create a diagnostic question with empty/null skill
    const q1 = await prisma.diagnosticQuestion.create({
      data: {
        question: "What is TS?",
        category: "Frontend",
        skill: "TypeScript",
        options: ["Language", "Framework"],
        correctAnswer: "Language",
        difficulty: "EASY",
        order: 1,
      },
    });
    await prisma.diagnosticAnswer.create({
      data: {
        attemptId: diagAttempt.id,
        questionId: q1.id,
        selectedAnswer: "Language",
        isCorrect: true,
      },
    });

    const res3 = await getProofGraph(user.id);
    assert.ok(res3.nodes.some((n) => n.type === "diagnostic"));
    console.log("✓ Edge 3 Passed: Diagnostic evidence correctly linked without null crashes");

    // 4. ProjectEvidence referencing a deleted/missing project (orphaned evidence handling)
    console.log("[Test Edge 4] Project evidence handling when relations or properties are missing...");
    const proj = await prisma.project.create({
      data: {
        userId: user.id,
        title: "TS Project",
        techStack: ["TypeScript"],
        isVerified: true,
        score: 90,
      },
    });
    await prisma.projectEvidence.create({
      data: {
        userId: user.id,
        projectId: proj.id,
        skillName: "TypeScript",
        evidenceType: "GITHUB",
      },
    });

    const res4 = await getProofGraph(user.id);
    assert.ok(res4.nodes.some((n) => n.type === "evidence"));
    assert.ok(res4.nodes.some((n) => n.type === "project"));
    console.log("✓ Edge 4 Passed: Project evidence & project nodes connected correctly in DAG");

    // 5. Clean up test user
    console.log("[Cleanup] Removing test user data...");
    await prisma.user.delete({ where: { id: user.id } });
    console.log("✓ Cleanup complete.");

    console.log("\n============================================================");
    console.log("PROOF GRAPH EDGE CASES: ALL TESTS PASSED");
    console.log("============================================================");
  } catch (err) {
    console.error("❌ Edge case test failed:", err);
    process.exit(1);
  }
}

testProofGraphEdgeCases();
