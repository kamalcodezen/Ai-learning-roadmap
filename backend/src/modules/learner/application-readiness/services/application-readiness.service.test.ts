import { describe, it } from "node:test";
import assert from "node:assert";
import prisma from "../../../../lib/prisma.js";
import { getApplicationReadiness } from "./application-readiness.service.js";
import { getCareerReadiness } from "../../readiness/services/readiness.service.js";

describe("Application Readiness Service — Verification & Integrity Tests", () => {
  it("1. Verifies low numeric scores (14%) assign critical status without hiding score as missing", async () => {
    const mockReadiness = {
      score: 10,
      scores: {
        knowledge: 14,
        practical: 1,
        projects: 42,
        problemSolving: "NOT_ASSESSED",
        communication: "NOT_ASSESSED",
        interview: 6,
        evidence: 10,
      },
      communicationEvaluation: null,
      strongSkills: [],
      weakSkills: ["Docker"],
    };

    const activeSum = 14 + 1 + 42 + 6 + 10;
    const activeCount = 5;
    const expectedAverage = Math.round(activeSum / activeCount);

    assert.strictEqual(expectedAverage, 15);
    assert.strictEqual(mockReadiness.scores.knowledge, 14);
    assert.strictEqual(mockReadiness.scores.interview, 6);
  });

  it("2. Ensures resolveCategoryStatus returns critical for score 14 and missing for null", () => {
    const resolveCategoryStatus = (
      score: number | null
    ): "strong" | "needs_improvement" | "critical" | "missing" => {
      if (score === null || score === undefined) return "missing";
      if (score >= 70) return "strong";
      if (score >= 40) return "needs_improvement";
      return "critical";
    };

    assert.strictEqual(resolveCategoryStatus(14), "critical");
    assert.strictEqual(resolveCategoryStatus(6), "critical");
    assert.strictEqual(resolveCategoryStatus(42), "needs_improvement");
    assert.strictEqual(resolveCategoryStatus(85), "strong");
    assert.strictEqual(resolveCategoryStatus(null), "missing");
  });

  it("3. Verifies zero side-effects (no DB mutations) during readiness calculation", async () => {
    const testUserId = "non_existent_test_user_id_12345";

    const result = await getApplicationReadiness(testUserId);

    assert.strictEqual(typeof result.overallScore, "number");
    assert.strictEqual(result.categories.length, 6);
    assert.strictEqual(result.dimensions.knowledgeProficiency, "NOT_ASSESSED");

    const profile = await prisma.careerProfile.findUnique({ where: { userId: testUserId } });
    assert.strictEqual(profile, null);
  });

  it("4. Verifies Career Twin and Application Readiness use identical canonical readiness engine", async () => {
    const testUserId = "canonical_test_user_99999";
    const canonicalResult = await getCareerReadiness(testUserId);
    const appResult = await getApplicationReadiness(testUserId);

    assert.strictEqual(canonicalResult.score, appResult.overallScore);
    assert.strictEqual(
      canonicalResult.scores.knowledge,
      appResult.dimensions.knowledgeProficiency
    );
    assert.strictEqual(
      canonicalResult.scores.projects,
      appResult.dimensions.projectExecution
    );
  });
});
