import assert from "node:assert";
import { buildChatPrompt } from "../src/modules/learner/copilot/chat.prompts.js";

async function verifyCopilotBehavior() {
  console.log("==================================================");
  console.log("VERIFYING AI COPILOT GUEST & AUTH PROMPT BEHAVIOR");
  console.log("==================================================");

  // Test 1: Guest Prompt Verification
  console.log("\n[Test 1] Testing Guest (Logged-out) Prompt Builder...");
  const guestPrompt = buildChatPrompt(undefined);

  assert(guestPrompt.includes("USER STATUS: GUEST VISITOR (UNAUTHENTICATED)"), "Guest prompt must declare GUEST VISITOR status");
  assert(guestPrompt.includes("NEVER instruct them to \"Open My Roadmap\""), "Guest prompt must strictly forbid telling guests to open My Roadmap");
  assert(guestPrompt.includes("Sign up for free"), "Guest prompt must enforce Sign up for free CTA");
  assert(guestPrompt.includes("INTERACTIVE MOCK INTERVIEW PROTOCOL"), "Must include single-turn mock interview protocol");
  assert(guestPrompt.includes("DISAMBIGUATION RULES (\"NODE\" VS \"NODE.JS\")"), "Must include Node vs Node.js disambiguation rule");
  assert(guestPrompt.includes("4-Pillar Mathematical Scoring Formula"), "Must include 4-pillar readiness score formula");
  assert(guestPrompt.includes("4-Stage Skill Mastery Simulations"), "Must include 4-stage simulation details");
  assert(guestPrompt.includes("Cryptographic Skill Proof Graph"), "Must include cryptographic proof info");
  console.log("✅ Test 1 Passed: Guest Prompt accurately enforces constraints and verified platform knowledge.");

  // Test 2: Explicit GUEST_VISITOR Context
  console.log("\n[Test 2] Testing Explicit GUEST_VISITOR Context...");
  const guestContextNotice = `[USER STATUS: GUEST_VISITOR (UNAUTHENTICATED)]\n- User is browsing as an unauthenticated visitor.`;
  const explicitGuestPrompt = buildChatPrompt(guestContextNotice);

  assert(explicitGuestPrompt.includes("USER STATUS: GUEST VISITOR (UNAUTHENTICATED)"), "Must detect guest notice");
  assert(!explicitGuestPrompt.includes("USER ACTIVE CAREER CONTEXT (LOGGED-IN LEARNER)"), "Must not include logged-in learner block for guest");
  console.log("✅ Test 2 Passed: Explicit GUEST_VISITOR context activates guest mandate.");

  // Test 3: Authenticated Learner Prompt
  console.log("\n[Test 3] Testing Authenticated Learner Context...");
  const learnerContext = `[AUTHENTICATED LEARNER CONTEXT]\nTarget Role: Full Stack Developer\nCurrent Milestone: Milestone 2 - REST APIs\nSkill Gaps: PostgreSQL`;
  const authPrompt = buildChatPrompt(learnerContext);

  assert(authPrompt.includes("USER ACTIVE CAREER CONTEXT (LOGGED-IN LEARNER)"), "Auth prompt must contain logged-in learner context");
  assert(authPrompt.includes("Milestone 2 - REST APIs"), "Auth prompt must retain milestone context");
  assert(authPrompt.includes("STRICT TARGET ROLE AWARENESS"), "Auth prompt must enforce target role awareness");
  console.log("✅ Test 3 Passed: Authenticated prompt accurately injects learner data and mandates.");

  console.log("\n==================================================");
  console.log("🎉 ALL 3 COPILOT BEHAVIOR VERIFICATIONS PASSED!");
  console.log("==================================================");
}

verifyCopilotBehavior().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
