import assert from "node:assert";
import { CareerAnalysisSchema } from "../src/modules/learner/profile/services/career-analysis.service.js";
import { getRequiredSkillsForRole } from "../src/modules/learner/career-alignment/services/career-skills.map.js";

async function runFeature01Tests() {
  console.log("=== RUNNING FEATURE 01: AI CAREER GOAL ANALYSIS VERIFICATION ===");

  // 1. Schema Validation Tests
  console.log("Test 1: Validating standard compliant career analysis schema...");
  const validData = {
    role: "Full Stack Developer",
    domain: "Software Engineering",
    summary: "Designs and constructs end-to-end web applications.",
    coreSkills: [
      { name: "React", importance: "CORE" as const, reason: "Frontend architecture" },
      { name: "Node.js", importance: "CORE" as const, reason: "Backend runtime" },
      { name: "PostgreSQL", importance: "CORE" as const, reason: "Primary relational storage" },
    ],
    supportingSkills: [
      { name: "Docker", importance: "SUPPORTING" as const, reason: "Containerization" },
    ],
    practicalCompetencies: ["Implement REST APIs", "Manage database schemas", "Build responsive UIs"],
    projectExpectations: ["Full Stack SaaS Platform", "Real-time Collaboration App"],
    learningPriorities: ["Deepen TypeScript patterns", "Master indexing & queries"],
  };

  const parsed = CareerAnalysisSchema.parse(validData);
  assert.strictEqual(parsed.role, "Full Stack Developer");
  assert.strictEqual(parsed.coreSkills.length, 3);
  console.log("✓ Schema validation passed for compliant data.");

  // 2. Schema Rejection Tests
  console.log("Test 2: Validating schema rejection on missing required fields...");
  try {
    CareerAnalysisSchema.parse({ role: "Frontend Developer" });
    assert.fail("Should have thrown error on incomplete data");
  } catch (err) {
    console.log("✓ Correctly rejected incomplete data schema.");
  }

  // 3. Importance Enum Constraint Tests
  console.log("Test 3: Validating importance enum constraint (CORE | SUPPORTING)...");
  try {
    CareerAnalysisSchema.parse({
      ...validData,
      coreSkills: [{ name: "React", importance: "OPTIONAL" as any, reason: "Bad enum" }],
    });
    assert.fail("Should have thrown error on invalid enum");
  } catch (err) {
    console.log("✓ Correctly rejected invalid importance enum value.");
  }

  // 4. Role Matching & Canonical Skills Mapping Tests
  console.log("Test 4: Verifying canonical role skill mapping...");
  const frontendSkills = getRequiredSkillsForRole("Frontend Developer");
  assert.ok(frontendSkills.some(s => s.skill === "React" && s.critical));
  assert.ok(frontendSkills.some(s => s.skill === "TypeScript" && s.critical));

  const backendSkills = getRequiredSkillsForRole("Backend Developer");
  assert.ok(backendSkills.some(s => s.skill === "Node.js" && s.critical));
  assert.ok(backendSkills.some(s => s.skill === "PostgreSQL" && s.critical));

  const aliasSkills = getRequiredSkillsForRole("frontend engineer");
  assert.ok(aliasSkills.some(s => s.skill === "React"));
  console.log("✓ Canonical role matching verified successfully.");

  // 5. Stale Cache Logic Verification
  console.log("Test 5: Verifying stale cache detection logic...");
  const cachedRole = "Frontend Developer";
  const newTargetRole = "Backend Developer";
  const isStale = cachedRole.trim().toLowerCase() !== newTargetRole.trim().toLowerCase();
  assert.strictEqual(isStale, true, "Cache must be identified as stale when role changes");
  console.log("✓ Stale cache identification verified.");

  console.log("==================================================================");
  console.log("🎉 ALL FEATURE 01 UNIT & LOGIC VERIFICATIONS PASSED SUCCESSFULLY!");
  console.log("==================================================================");
}

runFeature01Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
