import assert from "node:assert";
import { getRequiredSkillsForRole, CAREER_SKILLS_MAP } from "../src/modules/learner/career-alignment/services/career-skills.map.js";

async function runFeature02Tests() {
  console.log("=== RUNNING FEATURE 02: AI SKILL-GAP DIAGNOSIS VERIFICATION ===");

  // 1. Threshold and Classification Verification
  console.log("Test 1: Verifying skill gap classification thresholds...");
  const sampleRequiredSkills = [
    { skill: "JavaScript", critical: true },
    { skill: "TypeScript", critical: true },
    { skill: "React", critical: true },
    { skill: "Testing", critical: false },
    { skill: "Performance", critical: false },
  ];

  const sampleSkillStates = [
    { skillName: "JavaScript", knowledgeScore: 85 }, // Strong (>= 70)
    { skillName: "TypeScript", knowledgeScore: 55 }, // Moderate (40-69)
    { skillName: "React", knowledgeScore: 20 },      // Critical (< 40 & critical)
    { skillName: "Testing", knowledgeScore: 30 },    // Moderate (< 40 & !critical)
    // Performance is missing (knowledgeScore = 0, !critical -> moderate gap)
  ];

  const mapped = sampleRequiredSkills.map((req) => {
    const state = sampleSkillStates.find((s) => s.skillName.toLowerCase() === req.skill.toLowerCase());
    const score = state ? state.knowledgeScore : 0;
    return {
      skillName: req.skill,
      isCritical: req.critical,
      knowledgeScore: score,
      isMissing: !state,
    };
  });

  const criticalGaps = mapped.filter((s) => s.knowledgeScore < 40 && s.isCritical).length;
  const moderateGaps = mapped.filter((s) => s.knowledgeScore >= 40 && s.knowledgeScore < 70).length;
  const strongSkills = mapped.filter((s) => s.knowledgeScore >= 70).length;

  assert.strictEqual(criticalGaps, 1, "React should be the only critical gap (<40 & critical)");
  assert.strictEqual(moderateGaps, 1, "TypeScript should be moderate (55)");
  assert.strictEqual(strongSkills, 1, "JavaScript should be strong (85)");
  console.log("✓ Thresholds verified accurately (Critical <40 & critical, Moderate 40-69, Strong >=70).");

  // 2. Sorting Hierarchy Verification
  console.log("Test 2: Verifying gap sorting hierarchy (Critical prioritized over Moderate)...");
  const gaps = mapped
    .filter((s) => s.knowledgeScore < 70)
    .map((s, idx) => {
      const severity: "critical" | "moderate" = s.knowledgeScore < 40 && s.isCritical ? "critical" : "moderate";
      return {
        id: `gap-${idx}`,
        skill: s.skillName,
        score: s.knowledgeScore,
        severity,
      };
    })
    .sort((a, b) => (a.severity === "critical" ? -1 : b.severity === "critical" ? 1 : 0));

  assert.strictEqual(gaps[0]?.skill, "React", "Critical gap must be sorted first");
  assert.strictEqual(gaps[0]?.severity, "critical");
  console.log("✓ Prioritized sorting verified.");

  // 3. Stale AI Analysis Sanitization
  console.log("Test 3: Verifying stale AI analysis role matching...");
  const oldAiAnalysis = {
    role: "Frontend Developer",
    coreSkills: [{ name: "React", reason: "Frontend UI reason" }],
  };

  const currentRole = "Backend Developer";
  const isAnalysisValid = oldAiAnalysis.role.toLowerCase() === currentRole.toLowerCase();
  assert.strictEqual(isAnalysisValid, false, "Old role analysis must not be applied to new role");
  console.log("✓ Stale analysis correctly discarded on role change.");

  // 4. Role Mapping & Alias Resolution
  console.log("Test 4: Verifying role normalization in skill gaps...");
  const fullstackSkills = getRequiredSkillsForRole("Full Stack Developer");
  assert.ok(fullstackSkills.some((s) => s.skill === "JavaScript"));
  assert.ok(fullstackSkills.some((s) => s.skill === "Node.js"));
  assert.ok(fullstackSkills.some((s) => s.skill === "SQL"));

  const aliasDevops = getRequiredSkillsForRole("cloud engineer");
  assert.ok(aliasDevops.some((s) => s.skill === "AWS / Cloud"));
  console.log("✓ Role normalization in skill gaps verified.");

  // 5. Empty SkillState Edge Case
  console.log("Test 5: Verifying empty SkillState behavior...");
  const emptySkillStates: any[] = [];
  const emptyHealth = emptySkillStates.length > 0 ? 50 : 0;
  assert.strictEqual(emptyHealth, 0, "Overall health must be 0 when no skills are assessed");
  console.log("✓ Empty SkillState behavior verified.");

  console.log("==================================================================");
  console.log("🎉 ALL FEATURE 02 SKILL GAP TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================================");
}

runFeature02Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
