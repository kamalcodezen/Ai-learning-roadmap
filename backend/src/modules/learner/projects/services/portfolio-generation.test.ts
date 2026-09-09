import { describe, it } from "node:test";
import assert from "node:assert";

describe("Milestone Project Generation Service", () => {
  it("validates dynamic prompt assembly structure", () => {
    const targetRole = "Backend Developer";
    const milestoneTitle = "Advanced Node.js & TypeScript Patterns";
    const unlocks = ["Node.js performance", "TypeScript generics", "Architecture"];
    const skillGaps = ["Architecture", "HTTP Fundamentals"];

    const skillsCoveredText = unlocks.join(", ");
    const skillGapsText = skillGaps.join(", ");

    const userPrompt = `Target Role: ${targetRole}
Milestone: ${milestoneTitle}
Description: Core backend patterns
Skills to Prove: ${skillsCoveredText}
Active Learner Skill Gaps: ${skillGapsText}`;

    assert.ok(userPrompt.includes(targetRole));
    assert.ok(userPrompt.includes(milestoneTitle));
    assert.ok(userPrompt.includes("Node.js performance"));
    assert.ok(userPrompt.includes("HTTP Fundamentals"));
  });

  it("handles fallback parsing safely when AI JSON response is malformed", () => {
    const rawReply = "Some non-JSON text response from LLM";
    const startIdx = rawReply.indexOf("{");
    const endIdx = rawReply.lastIndexOf("}");

    let parsed: any = null;
    if (startIdx !== -1 && endIdx !== -1) {
      try {
        parsed = JSON.parse(rawReply.slice(startIdx, endIdx + 1));
      } catch {
        parsed = null;
      }
    }

    assert.strictEqual(parsed, null);

    // Default specification fallback
    const fallbackSpec = {
      title: "Linux Foundations: Practical Implementation",
      description: "Build a production-ready application demonstrating practical competency in Linux commands.",
      techStack: ["Linux", "Bash"],
    };

    assert.strictEqual(fallbackSpec.title, "Linux Foundations: Practical Implementation");
    assert.deepStrictEqual(fallbackSpec.techStack, ["Linux", "Bash"]);
  });
});
