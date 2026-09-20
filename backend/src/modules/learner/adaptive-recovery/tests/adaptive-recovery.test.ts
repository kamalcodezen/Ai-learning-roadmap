import test from "node:test";
import assert from "node:assert/strict";
import { getRoadmapSimulation } from "../services/roadmap-simulator.service.js";
import { getZeroGuiltRecoveryStatus } from "../services/zero-guilt-recovery.service.js";
import { getAiDependencyAnalysis } from "../services/ai-dependency-meter.service.js";

test("Roadmap Simulator - returns real simulation structure", async () => {
  // Use a non-existent or dummy user ID to test pure calculation and fallback handling
  const sim = await getRoadmapSimulation("test-user-calc-id");

  assert.ok(sim, "Simulator data should be returned");
  assert.ok(typeof sim.weeklyAvailableHours === "number");
  assert.ok(sim.weeklyAvailableHours >= 3, "Weekly hours should be at least 3");
  assert.ok(sim.currentPace, "Current pace projection point should exist");
  assert.ok(sim.currentPace.weeksRemaining >= 1, "Weeks remaining should be at least 1");
  assert.ok(Array.isArray(sim.projections), "Projections should be an array");
  assert.equal(sim.projections.length, 8, "Should have 8 comparison benchmark points");
});

test("Zero-Guilt Recovery - generates 4-day micro plan with safe non-punitive steps", async () => {
  const recovery = await getZeroGuiltRecoveryStatus("test-user-recovery-id");

  assert.ok(recovery, "Recovery status should be returned");
  assert.ok(Array.isArray(recovery.steps), "Steps should be an array");
  assert.equal(recovery.steps.length, 4, "Should have exactly 4 daily steps");

  // Day 1: Refresher
  assert.equal(recovery.steps[0]?.dayIndex, 1);
  assert.equal(recovery.steps[0]?.type, "REFRESHER");
  assert.ok(recovery.steps[0]?.content.details?.length, "Refresher must contain details");

  // Day 2: Puzzle
  assert.equal(recovery.steps[1]?.dayIndex, 2);
  assert.equal(recovery.steps[1]?.type, "PUZZLE");
  assert.ok(recovery.steps[1]?.content.puzzleQuestion, "Puzzle must have a question");
  assert.ok(recovery.steps[1]?.content.puzzleOptions?.length, "Puzzle must have options");

  // Day 3: Roadmap step
  assert.equal(recovery.steps[2]?.dayIndex, 3);
  assert.equal(recovery.steps[2]?.type, "ROADMAP_STEP");

  // Day 4: Momentum boost
  assert.equal(recovery.steps[3]?.dayIndex, 4);
  assert.equal(recovery.steps[3]?.type, "MOMENTUM_BOOST");
});

test("AI Dependency Meter - categorizes autonomy and computes 3 pillars", async () => {
  const ai = await getAiDependencyAnalysis("test-user-ai-id");

  assert.ok(ai, "AI Dependency data should be returned");
  assert.ok(ai.overallDependencyScore >= 0 && ai.overallDependencyScore <= 100);
  assert.ok(ai.autonomyScore >= 0 && ai.autonomyScore <= 100);
  assert.equal(ai.overallDependencyScore + ai.autonomyScore, 100, "Dependency + Autonomy should sum to 100");
  assert.ok(["INDEPENDENT", "BALANCED", "HIGH_RELIANCE"].includes(ai.category));
  assert.ok(ai.pillars.promptAutonomy, "Prompt pillar should exist");
  assert.ok(ai.pillars.projectExplanation, "Project explanation pillar should exist");
  assert.ok(ai.pillars.interviewArticulation, "Interview articulation pillar should exist");
  assert.ok(Array.isArray(ai.actionableRemedies), "Remedies should be an array");
});
