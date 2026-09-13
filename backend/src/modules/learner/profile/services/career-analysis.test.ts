import { describe, it } from "node:test";
import assert from "node:assert";
import { CareerAnalysisSchema } from "./career-analysis.service.js";
import { getRequiredSkillsForRole } from "../../career-alignment/services/career-skills.map.js";

describe("Feature 01: Career Goal Analysis Service", () => {
  it("validates a compliant career analysis object", () => {
    const validData = {
      role: "Frontend Developer",
      domain: "Software Engineering",
      summary: "Builds user interfaces using modern web technologies.",
      coreSkills: [
        { name: "React", importance: "CORE" as const, reason: "Fundamental UI framework" },
        { name: "TypeScript", importance: "CORE" as const, reason: "Type safety in production apps" },
      ],
      supportingSkills: [
        { name: "Tailwind CSS", importance: "SUPPORTING" as const, reason: "Rapid styling" },
      ],
      practicalCompetencies: ["Build responsive web apps", "Manage client state"],
      projectExpectations: ["E-commerce storefront with cart", "Dashboard analytics UI"],
      learningPriorities: ["Master React hooks", "Deep dive into TypeScript generics"],
    };

    const parsed = CareerAnalysisSchema.parse(validData);
    assert.strictEqual(parsed.role, "Frontend Developer");
    assert.strictEqual(parsed.coreSkills.length, 2);
  });

  it("rejects an object with missing required fields", () => {
    const invalidData = {
      role: "Frontend Developer",
    };

    assert.throws(() => CareerAnalysisSchema.parse(invalidData));
  });

  it("rejects invalid importance enum values", () => {
    const invalidEnumData = {
      role: "Frontend Developer",
      domain: "Software Engineering",
      summary: "Builds user interfaces",
      coreSkills: [
        { name: "React", importance: "INVALID_IMPORTANCE" as any, reason: "Reason" },
      ],
      supportingSkills: [],
      practicalCompetencies: [],
      projectExpectations: [],
      learningPriorities: [],
    };

    assert.throws(() => CareerAnalysisSchema.parse(invalidEnumData));
  });

  it("verifies canonical role mapping and aliases", () => {
    const frontendSkills = getRequiredSkillsForRole("Frontend Developer");
    assert.ok(frontendSkills.some(s => s.skill === "React" && s.critical));

    const backendSkills = getRequiredSkillsForRole("Backend Developer");
    assert.ok(backendSkills.some(s => s.skill === "Node.js" && s.critical));

    const aliasSkills = getRequiredSkillsForRole("frontend engineer");
    assert.ok(aliasSkills.some(s => s.skill === "React"));
  });
});
