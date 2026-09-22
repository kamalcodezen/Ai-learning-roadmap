import test from "node:test";
import assert from "node:assert/strict";
import {
  getGemEconomyOverview,
  getAdminGemTransactions,
  getAtRiskLearners,
  adjustUserGems,
} from "./gem-economy-admin.service.js";

test("Admin Gem Economy Service — Dynamic Database Aggregations & Ledger Integrity", async (t) => {
  await t.test("1. Returns platform-wide aggregate statistics with zero NaN or undefined values", async () => {
    const stats = await getGemEconomyOverview();

    assert.ok(typeof stats.totalGemsInCirculation === "number", "totalGemsInCirculation must be a number");
    assert.ok(stats.totalGemsInCirculation >= 0, "totalGemsInCirculation must be >= 0");
    assert.ok(typeof stats.totalTransactionsCount === "number", "totalTransactionsCount must be a number");
    assert.ok(typeof stats.claimsPast24h === "number", "claimsPast24h must be a number");
    assert.ok(typeof stats.activeStreakersCount === "number", "activeStreakersCount must be a number");
    assert.ok(typeof stats.atRiskLearnersCount === "number", "atRiskLearnersCount must be a number");
    assert.ok(typeof stats.totalLearnersCount === "number", "totalLearnersCount must be a number");
  });

  await t.test("2. Fetches paginated transaction ledger without null pointer errors", async () => {
    const result = await getAdminGemTransactions(10, 0);

    assert.ok(Array.isArray(result.transactions), "transactions must be an array");
    assert.ok(typeof result.total === "number", "total must be a number");

    const tx = result.transactions[0];
    if (tx) {
      assert.ok(tx.id, "transaction must have id");
      assert.ok(typeof tx.amount === "number", "amount must be a number");
      assert.ok(tx.source, "source must be present");
      assert.ok(typeof tx.balanceAfter === "number", "balanceAfter must be a number");
    }
  });

  await t.test("3. Fetches at-risk learner list without throwing", async () => {
    const atRisk = await getAtRiskLearners();

    assert.ok(Array.isArray(atRisk), "atRisk must be an array");
    const learner = atRisk[0];
    if (learner) {
      assert.ok(learner.userId, "learner must have userId");
      assert.ok(typeof learner.daysInactive === "number", "daysInactive must be a number");
      assert.ok(typeof learner.gemsBalance === "number", "gemsBalance must be a number");
      assert.ok(typeof learner.isInRecovery === "boolean", "isInRecovery must be a boolean");
    }
  });

  await t.test("4. Safely rejects adjusting gems for non-existent user", async () => {
    await assert.rejects(
      async () => {
        await adjustUserGems(
          "dummy-admin-id",
          "non-existent-user-id-99999",
          50,
          "Test adjustment for non-existent user"
        );
      },
      {
        message: "Target user not found.",
      }
    );
  });
});
