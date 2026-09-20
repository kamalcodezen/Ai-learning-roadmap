import { describe, it } from "node:test";
import assert from "node:assert/strict";
import prisma from "../../../../lib/prisma.js";
import {
  getGemWallet,
  claimDailyStreakGems,
  awardGems,
  getGemHistory,
  getGemsForStreakDay,
} from "../services/gem-economy.service.js";

describe("Gem Economy System — Dynamic Gems & Atomic Ledger", () => {
  const testUserId = `test-user-gems-${Date.now()}`;

  it("calculates streak ladder rewards dynamically (1, 2, 5 gems)", () => {
    assert.equal(getGemsForStreakDay(1), 1);
    assert.equal(getGemsForStreakDay(2), 1);
    assert.equal(getGemsForStreakDay(3), 1);
    assert.equal(getGemsForStreakDay(4), 2);
    assert.equal(getGemsForStreakDay(5), 2);
    assert.equal(getGemsForStreakDay(6), 2);
    assert.equal(getGemsForStreakDay(7), 5);
  });

  it("initializes learner wallet with default 10 welcome gems", async () => {
    // Setup test user with emailVerified: true
    await prisma.user.create({
      data: {
        id: testUserId,
        email: `${testUserId}@example.com`,
        name: "Test Gem Learner",
        role: "LEARNER",
        emailVerified: true,
      },
    });

    const wallet = await getGemWallet(testUserId);
    assert.equal(wallet.gemsBalance, 10);
    assert.equal(wallet.streak.todayClaimed, false);
    assert.equal(wallet.streak.todayRewardGems, 1);
    assert.equal(wallet.streak.nextStreakDay, 1);
  });

  it("claims daily streak gem and rejects duplicate claim on same day", async () => {
    const claim1 = await claimDailyStreakGems(testUserId);
    assert.equal(claim1.success, true);
    assert.equal(claim1.awardedGems, 1);
    assert.equal(claim1.newBalance, 11);

    // Duplicate claim on same day
    const claim2 = await claimDailyStreakGems(testUserId);
    assert.equal(claim2.success, false);
    assert.equal(claim2.awardedGems, 0);
    assert.equal(claim2.newBalance, 11);
  });

  it("awards gems dynamically for milestone completion with atomic ledger", async () => {
    const result = await awardGems(
      testUserId,
      8,
      "MILESTONE_COMPLETED",
      "Completed Capstone Architecture Milestone (+8 💎)",
      "milestone-capstone-99"
    );

    assert.equal(result.awarded, true);
    assert.equal(result.awardedAmount, 8);
    assert.equal(result.gemsBalance, 19);

    // Verify history ledger
    const history = await getGemHistory(testUserId);
    assert.ok(history.total >= 2);
    const milestoneTx = history.transactions.find((tx) => tx.source === "MILESTONE_COMPLETED");
    assert.ok(milestoneTx);
    assert.equal(milestoneTx.amount, 8);
  });
});
