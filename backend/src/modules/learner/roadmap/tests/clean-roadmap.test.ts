import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_ROLE_CURRICULA,
  getCanonicalRoleCurriculum,
  buildDynamicRoleDefinition,
} from "../../career-alignment/services/career-skills.map.js";
import {
  validateRoadmapCompleteness,
  generateDeterministicRoadmap,
  overlayLearnerSkillState,
} from "../services/learning-path.service.js";

describe("Clean Role-Specific Dynamic Roadmap Tests", () => {
  it("1. Verifies all known target roles possess a multi-phase canonical curriculum with at least 5 milestones", () => {
    const knownRoles = Object.keys(CANONICAL_ROLE_CURRICULA);
    assert.ok(knownRoles.length >= 6, "Expected at least 6 canonical role templates");

    for (const role of knownRoles) {
      const benchmark = CANONICAL_ROLE_CURRICULA[role];
      assert.ok(benchmark, `Role ${role} curriculum must be defined`);
      assert.ok(
        benchmark.milestones && benchmark.milestones.length >= 5,
        `Role ${role} curriculum must have at least 5 complete milestones, found ${benchmark.milestones?.length || 0}`
      );

      // Verify each milestone has clear title, skills, description, and phase
      for (const m of benchmark.milestones) {
        assert.ok(m.title && m.title.trim().length > 0, `Milestone in ${role} missing title`);
        assert.ok(m.skillsCovered && m.skillsCovered.length > 0, `Milestone ${m.title} in ${role} missing skills`);
        assert.ok(m.description && m.description.length > 10, `Milestone ${m.title} in ${role} missing description`);
        assert.ok(m.whyItMatters && m.whyItMatters.length > 5, `Milestone ${m.title} in ${role} missing whyItMatters`);
      }
    }
  });

  it("2. Verifies buildDynamicRoleDefinition creates a complete curriculum for any arbitrary role", () => {
    const customRole = "AI Robotics Software Engineer";
    const dynamicDef = buildDynamicRoleDefinition(customRole);

    assert.equal(dynamicDef.roleName, customRole);
    assert.ok(dynamicDef.milestones.length >= 6, "Custom role must generate at least 6 milestones");
    assert.ok(dynamicDef.requiredSkills.length >= 5, "Custom role must generate core required skills");

    const phases = new Set(dynamicDef.milestones.map((m) => m.phase));
    assert.ok(phases.has("FOUNDATIONS") || phases.has("CORE_CONCEPTS") || phases.has("INTERMEDIATE_SYSTEMS"), "Curriculum should have foundational phases");
  });

  it("3. Verifies validateRoadmapCompleteness rejects fragmented AI roadmaps and completes via fallback", () => {
    const targetRole = "Full Stack Developer";
    const canonicalDef = getCanonicalRoleCurriculum(targetRole);
    const fragmentedRoadmap = {
      roadmapTitle: "Fragmented Roadmap",
      milestones: [
        {
          title: "HTML & CSS",
          skillsCovered: ["HTML", "CSS"],
          estimatedTime: "2 weeks",
          description: "Basics only",
          whyItMatters: "Web structure",
        },
      ],
    };

    const validation = validateRoadmapCompleteness(fragmentedRoadmap, targetRole, canonicalDef);
    assert.equal(validation.valid, false, "Fragmented 1-milestone roadmap must be rejected as incomplete");
    assert.ok(validation.errors.length > 0);

    // Verify fallback generation produces full curriculum
    const fallback = generateDeterministicRoadmap(targetRole);
    assert.ok(fallback.milestones.length >= 6, "Deterministic fallback must contain complete curriculum");
    assert.ok(fallback.milestones.some((m) => m.title.includes("Database") || m.title.includes("Backend") || m.title.includes("Architecture")));
  });

  it("4. Verifies overlayLearnerSkillState correctly reflects verified skills as completed without dropping roadmap scope", () => {
    const roleDef = getCanonicalRoleCurriculum("Full Stack Developer");
    const baseMilestones = roleDef.milestones.map((m, idx) => ({
      id: `ms-${idx}`,
      title: m.title,
      skillsCovered: m.skillsCovered,
      estimatedTime: m.estimatedTime,
      description: m.description,
      whyItMatters: m.whyItMatters,
      phase: m.phase,
    }));

    // Simulated learner skill states where foundational skills are verified at 100%
    const mockSkillStates = [
      { skill: { name: "HTML/CSS" }, verifiedScore: 100 },
      { skill: { name: "JavaScript" }, verifiedScore: 100 },
      { skill: { name: "Git" }, verifiedScore: 100 },
      { skill: { name: "DOM Manipulation" }, verifiedScore: 100 },
      { skill: { name: "TypeScript" }, verifiedScore: 90 },
      { skill: { name: "React" }, verifiedScore: 90 },
    ];

    const overlaid = overlayLearnerSkillState(baseMilestones, mockSkillStates as any);

    // Total milestones count should remain exactly identical (no pollution or drop)
    assert.equal(overlaid.length, baseMilestones.length);

    // First milestone covering HTML/CSS/JS should now be completed
    assert.equal(overlaid[0].status, "COMPLETED");
    // Active frontier should advance to next milestone
    assert.ok(overlaid.some((m) => m.status === "CURRENT"));
  });

  it("5. Zero-Pollution Test: Ensures evidence or GitHub repo titles never pollute milestone definitions", () => {
    const roles = ["Frontend Developer", "Backend Developer", "Data Scientist"];
    const suspiciousTokens = ["my-repo", "github.com", "commit", "pull request", "assignment-1", "user-repo"];

    for (const role of roles) {
      const def = getCanonicalRoleCurriculum(role);
      for (const m of def.milestones) {
        for (const token of suspiciousTokens) {
          assert.ok(
            !m.title.toLowerCase().includes(token),
            `Milestone title "${m.title}" contains suspicious evidence token: ${token}`
          );
          assert.ok(
            !m.description.toLowerCase().includes(token),
            `Milestone description "${m.description}" contains suspicious evidence token: ${token}`
          );
        }
      }
    }
  });
});
