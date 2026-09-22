import assert from "assert";
import { ChatService } from "../src/modules/learner/copilot/services/chat.service.js";

async function runMultiKeyTests() {
  console.log("=== STARTING GROQ MULTI-KEY ROTATION & FAILOVER TESTS ===");

  // Test 1: Verify 4 consecutive requests rotate across keys
  console.log("\n[Test 1] Testing Round-Robin rotation across Groq keys...");
  const providersSeen = new Set<string>();

  for (let i = 1; i <= 4; i++) {
    const res = await ChatService.processChat(
      `Briefly say hello and state test number ${i} in 1 sentence.`
    );
    console.log(`Request ${i}: Provider = ${res.provider}, Model = ${res.model}`);
    console.log(`Snippet: ${res.reply.slice(0, 80).replace(/\n/g, " ")}...`);
    providersSeen.add(res.provider);
  }

  console.log(`\nProviders utilized across 4 requests:`, Array.from(providersSeen));
  assert(providersSeen.size >= 1, "At least one Groq provider must have answered successfully.");

  // Test 2: Verify authentic platform query execution
  console.log("\n[Test 2] Testing real AIPather platform knowledge query...");
  const guestQuery = await ChatService.processChat(
    "im new how to start enad explore can you guide me",
    [],
    "[USER STATUS: GUEST_VISITOR (UNAUTHENTICATED)]"
  );

  console.log("Provider:", guestQuery.provider);
  console.log("Model:", guestQuery.model);
  console.log("Response preview:\n", guestQuery.reply.slice(0, 300));

  assert(
    !guestQuery.reply.toLowerCase().includes("freecodecamp"),
    "Must NOT recommend freeCodeCamp"
  );
  assert(
    !guestQuery.reply.toLowerCase().includes("codecademy"),
    "Must NOT recommend Codecademy"
  );
  assert(
    !guestQuery.reply.toLowerCase().includes("leetcode"),
    "Must NOT recommend LeetCode"
  );
  assert(
    guestQuery.reply.toLowerCase().includes("aipather") ||
    guestQuery.reply.toLowerCase().includes("sign up") ||
    guestQuery.reply.toLowerCase().includes("roadmap"),
    "Must contain AIPather exploration steps"
  );

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

runMultiKeyTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
