import { describe, it } from "node:test";
import assert from "node:assert";
import { isMatchingSkill } from "../../assessments/services/skill-simulation.service.js";

describe("Skill Gaps Navigation Mismatch Fix", () => {
  const targetSkills = [
    "Architecture",
    "Debugging",
    "AWS / Cloud",
    "CI/CD",
    "Kubernetes",
    "Docker",
    "Linux",
  ];

  it("verifies exact self-matching for all critical skill gap target skills", () => {
    for (const skill of targetSkills) {
      assert.strictEqual(
        isMatchingSkill(skill, skill),
        true,
        `Expected ${skill} to match itself`
      );
    }
  });

  it("ensures Architecture does not match Debugging", () => {
    assert.strictEqual(isMatchingSkill("Architecture", "Debugging"), false);
    assert.strictEqual(isMatchingSkill("Debugging", "Architecture"), false);
  });

  it("verifies canonical variations match correctly", () => {
    assert.strictEqual(
      isMatchingSkill("Architecture", "System Architecture & Design"),
      true
    );
    assert.strictEqual(
      isMatchingSkill("AWS / Cloud", "AWS"),
      true
    );
    assert.strictEqual(
      isMatchingSkill("CI/CD", "CI/CD Pipelines & Automation"),
      true
    );
    assert.strictEqual(
      isMatchingSkill("Kubernetes", "Kubernetes & Container Orchestration"),
      true
    );
    assert.strictEqual(
      isMatchingSkill("Docker", "Docker Containerization"),
      true
    );
    assert.strictEqual(
      isMatchingSkill("Linux", "Linux System Administration"),
      true
    );
  });
});
