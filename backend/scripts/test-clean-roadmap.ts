import assert from "node:assert";
import {
  getCanonicalRoleDefinition,
  buildDynamicRoleDefinition,
} from "../src/modules/learner/career-alignment/services/career-skills.map.js";
import {
  generateDeterministicRoadmap,
  validateRoadmapCompleteness,
  overlayLearnerSkillState,
} from "../src/modules/learner/roadmap/services/learning-path.service.js";

async function runCleanRoadmapTests() {
  console.log("============================================================");
  console.log("AI PATHER — CLEAN LEARNING ROADMAP VERIFICATION SUITE");
  console.log("============================================================");

  // ------------------------------------------------------------
  // SECTION 1: Exact Target Role Identity & Canonical Curricula
  // ------------------------------------------------------------
  console.log("\n--- SECTION 1: Role Identity & Exact Target Role Preservation ---");

  const rolesToTest = [
    { input: "Software Engineer", expectedDomain: "Core Computer Science & Software Systems", minMilestones: 7 },
    { input: "Full Stack Developer", expectedDomain: "Web & Software Engineering", minMilestones: 8 },
    { input: "UI/UX Designer", expectedDomain: "Product Design & User Experience", minMilestones: 7 },
    { input: "Power BI Developer", expectedDomain: "Business Intelligence & Data Analytics", minMilestones: 7 },
    { input: "Data Analyst", expectedDomain: "Data Analytics & Business Intelligence", minMilestones: 7 },
    { input: "Game Developer", expectedDomain: "Game Development & Real-Time Interactive Systems", minMilestones: 7 },
    { input: "Salesforce Developer", expectedDomain: "Salesforce Developer Engineering & Domain Practice", minMilestones: 6 },
    { input: "Blockchain Developer", expectedDomain: "Blockchain Developer Engineering & Domain Practice", minMilestones: 6 },
  ];

  for (const { input, expectedDomain, minMilestones } of rolesToTest) {
    const canonical = getCanonicalRoleDefinition(input);
    assert.strictEqual(canonical.roleName, input, `Role name must match exact input '${input}'`);
    assert.ok(canonical.domain.includes(expectedDomain) || canonical.domain === expectedDomain, `Domain must match for ${input}`);
    assert.ok(canonical.milestones.length >= minMilestones, `Must have at least ${minMilestones} milestones for ${input}, got ${canonical.milestones.length}`);
    console.log(`  ✓ Preserved Role [${input}] -> ${canonical.milestones.length} milestones, Domain: '${canonical.domain}'`);
  }

  // ------------------------------------------------------------
  // SECTION 2: Clean Curriculum — No GitHub / Evidence Pollution
  // ------------------------------------------------------------
  console.log("\n--- SECTION 2: Clean Curriculum Defense Against Evidence Pollution ---");

  // Scenario: Learner has a project "StartupForge" with random stack technologies in their evidence/skills:
  const pollutedLearnerSkills = [
    { skillName: "Next.js", knowledgeScore: 20, practiceScore: 20, evidenceScore: 10 },
    { skillName: "React", knowledgeScore: 25, practiceScore: 25, evidenceScore: 15 },
    { skillName: "Tailwind CSS", knowledgeScore: 30, practiceScore: 30, evidenceScore: 20 },
    { skillName: "Framer Motion", knowledgeScore: 15, practiceScore: 0, evidenceScore: 0 },
    { skillName: "HeroUI", knowledgeScore: 10, practiceScore: 0, evidenceScore: 0 },
    { skillName: "Better Auth", knowledgeScore: 15, practiceScore: 0, evidenceScore: 0 },
    { skillName: "MongoDB", knowledgeScore: 20, practiceScore: 20, evidenceScore: 10 },
    { skillName: "Stripe", knowledgeScore: 15, practiceScore: 10, evidenceScore: 10 },
    { skillName: "Data Structures & Algorithms", knowledgeScore: 85, practiceScore: 80, evidenceScore: 60 },
    { skillName: "Git & Version Control", knowledgeScore: 90, practiceScore: 85, evidenceScore: 80 },
    { skillName: "Problem Solving", knowledgeScore: 80, practiceScore: 75, evidenceScore: 70 },
  ];

  // Target Role: Software Engineer
  const sweRoadmap = generateDeterministicRoadmap("Software Engineer", "BEGINNER", 15);
  const sweSkillsCovered = sweRoadmap.milestones.flatMap(m => [...m.skillsCovered, ...m.technologies]);

  // Software Engineer roadmap MUST NOT contain non-canonical learner technologies:
  const forbiddenSweTech = ["Framer Motion", "HeroUI", "Better Auth", "Stripe"];
  for (const tech of forbiddenSweTech) {
    const hasPollution = sweSkillsCovered.some(s => s.toLowerCase().includes(tech.toLowerCase()));
    assert.strictEqual(hasPollution, false, `Software Engineer roadmap must NOT contain learner project tech '${tech}'`);
  }
  console.log(`  ✓ Software Engineer roadmap is clean: 0 forbidden project technologies found.`);

  // Verify Software Engineer roadmap contains foundational SWE topics
  const requiredSweTopics = ["Data Structures", "Algorithms", "Object-Oriented", "Databases", "Testing", "System Design"];
  for (const topic of requiredSweTopics) {
    const hasTopic = sweRoadmap.milestones.some(m => 
      m.title.toLowerCase().includes(topic.toLowerCase()) ||
      m.skillsCovered.some(s => s.toLowerCase().includes(topic.toLowerCase()))
    );
    assert.ok(hasTopic, `Software Engineer roadmap must contain topic '${topic}'`);
  }
  console.log(`  ✓ Software Engineer roadmap contains all required canonical CS/SWE topics.`);

  // ------------------------------------------------------------
  // SECTION 3: Non-Destructive Learner SkillState Overlay
  // ------------------------------------------------------------
  console.log("\n--- SECTION 3: Learner SkillState Personalization Overlay ---");

  const personalizedSweMilestones = overlayLearnerSkillState(sweRoadmap.milestones, pollutedLearnerSkills);

  // Milestone 1 (CS Fundamentals / Data Structures & Git) has score >= 70% in learner skills -> COMPLETED
  assert.strictEqual(personalizedSweMilestones[0].status, "COMPLETED", "Milestone 1 should be COMPLETED since learner mastered DSA and Git");
  assert.strictEqual(personalizedSweMilestones[0].progress, 100, "Completed milestone must have 100% progress");

  // Milestone 2 (Advanced Algorithms / Object-Oriented) is uncompleted -> CURRENT
  assert.strictEqual(personalizedSweMilestones[1].status, "CURRENT", "Milestone 2 should become active learning frontier (CURRENT)");
  
  // Subsequent milestones -> UPCOMING
  for (let i = 2; i < personalizedSweMilestones.length; i++) {
    assert.strictEqual(personalizedSweMilestones[i].status, "UPCOMING", `Milestone ${i + 1} should be UPCOMING`);
    assert.strictEqual(personalizedSweMilestones[i].progress, 0, `Upcoming milestone ${i + 1} progress must be 0`);
  }

  // Ensure ALL milestones remain in the roadmap (no nodes deleted)
  assert.strictEqual(personalizedSweMilestones.length, sweRoadmap.milestones.length, "No roadmap nodes should be deleted or hidden by SkillState");
  console.log(`  ✓ All ${personalizedSweMilestones.length} milestones preserved: M1=COMPLETED, M2=CURRENT, M3..M${personalizedSweMilestones.length}=UPCOMING.`);

  // ------------------------------------------------------------
  // SECTION 4: Completeness Validation Defense
  // ------------------------------------------------------------
  console.log("\n--- SECTION 4: Strict Roadmap Completeness Validation ---");

  const canonicalUiUx = getCanonicalRoleDefinition("UI/UX Designer");
  const validUiUxRoadmap = generateDeterministicRoadmap("UI/UX Designer", "BEGINNER", 15);
  const validationValid = validateRoadmapCompleteness(validUiUxRoadmap, "UI/UX Designer", canonicalUiUx);
  assert.strictEqual(validationValid.valid, true, "Valid UI/UX roadmap must pass validation");
  console.log(`  ✓ Valid UI/UX Designer roadmap passed completeness check.`);

  // Incomplete roadmap (< 5 milestones)
  const incompleteRoadmap = {
    roadmapTitle: "UI/UX Short",
    milestones: [
      { title: "Figma Basics", phase: "FOUNDATIONS", skillsCovered: ["Figma"], technologies: ["Figma"], description: "Basics", whyItMatters: "Important" },
      { title: "Color Theory", phase: "CORE_CONCEPTS", skillsCovered: ["Color"], technologies: ["Figma"], description: "Color", whyItMatters: "Important" },
    ]
  };
  const validationIncomplete = validateRoadmapCompleteness(incompleteRoadmap, "UI/UX Designer", canonicalUiUx);
  assert.strictEqual(validationIncomplete.valid, false, "Incomplete roadmap must fail validation");
  console.log(`  ✓ Incomplete roadmap correctly rejected (< 5 stages).`);

  // Wrong-domain polluted roadmap (SWE curriculum submitted for UI/UX)
  const wrongDomainRoadmap = {
    roadmapTitle: "UI/UX Designer",
    milestones: [
      { title: "Foundations", phase: "FOUNDATIONS", skillsCovered: ["C++", "Pointers"], technologies: ["GCC"], description: "C++ foundations", whyItMatters: "Memory", projectDeliverable: "Compiler" },
      { title: "Data Structures", phase: "CORE_CONCEPTS", skillsCovered: ["B-Trees", "Hash Tables"], technologies: ["C++"], description: "Data structures", whyItMatters: "Big-O", projectDeliverable: "Library" },
      { title: "Distributed Systems", phase: "INTERMEDIATE_SYSTEMS", skillsCovered: ["Raft", "Paxos"], technologies: ["Go"], description: "Consensus", whyItMatters: "Scale", projectDeliverable: "Cluster" },
      { title: "Kernel Tuning", phase: "ADVANCED_ARCHITECTURE", skillsCovered: ["eBPF"], technologies: ["Linux"], description: "Kernel", whyItMatters: "Latency", projectDeliverable: "Driver" },
      { title: "Cap", phase: "JOB_READINESS", skillsCovered: ["Cap"], technologies: ["Git"], description: "Cap", whyItMatters: "Cap", projectDeliverable: "Cap" },
    ]
  };
  const validationWrongDomain = validateRoadmapCompleteness(wrongDomainRoadmap, "UI/UX Designer", canonicalUiUx);
  assert.strictEqual(validationWrongDomain.valid, false, "Wrong-domain polluted roadmap must fail validation");
  console.log(`  ✓ Wrong-domain polluted roadmap correctly rejected.`);

  console.log("\n============================================================");
  console.log("ALL CLEAN ROADMAP TESTS PASSED (100%)!");
  console.log("============================================================");
}

runCleanRoadmapTests().catch((err) => {
  console.error("Clean Roadmap Tests Failed:", err);
  process.exit(1);
});
