import { serverFetch, serverMutation } from "../../core/server";

export interface StreakLadderDay {
  day: number;
  gems: number;
  claimed: boolean;
  isCurrent: boolean;
}

export interface DailyStreakStatus {
  currentStreakDays: number;
  todayClaimed: boolean;
  todayRewardGems: number;
  nextStreakDay: number;
  streakLadder: StreakLadderDay[];
  lastClaimDate: string | null;
}

export interface GemTransactionItem {
  id: string;
  amount: number;
  source: string;
  description: string;
  referenceId?: string | null;
  balanceAfter: number;
  createdAt: string;
}

export interface GemWalletSummary {
  gemsBalance: number;
  lifetimeGemsEarned: number;
  streak: DailyStreakStatus;
  recentTransactions: GemTransactionItem[];
}

export interface ClaimDailyGemsResponse {
  success: boolean;
  awardedGems: number;
  newBalance: number;
  streakDay: number;
  message: string;
}

/**
 * Retrieves the learner's live Gem wallet balance, streak, and recent earnings.
 */
export const getGemWallet = async (): Promise<GemWalletSummary> => {
  const res = await serverFetch("/api/gem-economy/wallet");
  return res.data;
};

/**
 * Claims today's daily streak gem reward dynamically.
 */
export const claimDailyGems = async (): Promise<ClaimDailyGemsResponse> => {
  const res = await serverMutation("/api/gem-economy/claim-daily", undefined, "POST");
  return res.data;
};

/**
 * Retrieves paginated transaction history of earned gems.
 */
export const getGemHistory = async (
  limit = 20,
  offset = 0
): Promise<{ transactions: GemTransactionItem[]; total: number }> => {
  const res = await serverFetch(`/api/gem-economy/history?limit=${limit}&offset=${offset}`);
  return res.data;
};
