import { serverFetch, serverMutation } from "../../core/server";

export interface GemEconomyOverviewStats {
  totalGemsInCirculation: number;
  totalTransactionsCount: number;
  claimsPast24h: number;
  activeStreakersCount: number;
  atRiskLearnersCount: number;
  totalLearnersCount: number;
}

export interface AdminGemTransactionItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userImage?: string | null;
  amount: number;
  source: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface AtRiskLearnerItem {
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  targetRole?: string | null;
  daysInactive: number;
  gemsBalance: number;
  lastActiveDate: string | null;
  isInRecovery: boolean;
}

export interface AdjustUserGemsPayload {
  targetUserId: string;
  amount: number;
  reason?: string;
}

/**
 * Fetches platform-wide treasury statistics for the AI Gem Economy.
 */
export async function getAdminGemEconomyOverview(adminUserId: string): Promise<GemEconomyOverviewStats> {
  const query = new URLSearchParams({ userId: adminUserId });
  const res = await serverFetch(`/api/admin/gem-economy/overview?${query.toString()}`);
  return res.data;
}

/**
 * Fetches paginated real-time transaction audit log.
 */
export async function getAdminGemTransactions(
  adminUserId: string,
  limit = 20,
  offset = 0,
  search?: string
): Promise<{ transactions: AdminGemTransactionItem[]; total: number }> {
  const query = new URLSearchParams({
    userId: adminUserId,
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (search) query.append("search", search);

  const res = await serverFetch(`/api/admin/gem-economy/transactions?${query.toString()}`);
  return res.data;
}

/**
 * Manually adjusts (credits or debits) gems for a specified learner.
 */
export async function adjustAdminUserGems(
  adminUserId: string,
  payload: AdjustUserGemsPayload
): Promise<{ success: boolean; newBalance: number; message: string }> {
  const query = new URLSearchParams({ userId: adminUserId });
  const res = await serverMutation(
    `/api/admin/gem-economy/adjust?${query.toString()}`,
    { ...payload, userId: adminUserId },
    "POST"
  );
  return res;
}

export interface GemSearchLearnerItem {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  gemsBalance: number;
}

/**
 * Searches learners by name or email for quick selection in the gem award modal.
 */
export async function searchAdminLearnersForGems(
  adminUserId: string,
  query: string
): Promise<GemSearchLearnerItem[]> {
  const params = new URLSearchParams({
    userId: adminUserId,
    q: query,
  });
  const res = await serverFetch(`/api/admin/gem-economy/search-learners?${params.toString()}`);
  return res.data || [];
}

/**
 * Retrieves learners who have been inactive for >= 7 days with search & pagination.
 */
export async function getAdminAtRiskLearners(
  adminUserId: string,
  limit = 20,
  offset = 0,
  search?: string
): Promise<AtRiskLearnerItem[]> {
  const query = new URLSearchParams({
    userId: adminUserId,
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (search) query.append("search", search);
  const res = await serverFetch(`/api/admin/gem-economy/at-risk?${query.toString()}`);
  return res.data;
}

/**
 * Sends recovery encouragement notification to an inactive learner.
 */
export async function sendAdminRecoveryReminder(
  adminUserId: string,
  targetUserId: string,
  customMessage?: string
): Promise<{ success: boolean; message: string }> {
  const query = new URLSearchParams({ userId: adminUserId });
  const res = await serverMutation(
    `/api/admin/gem-economy/remind?${query.toString()}`,
    { targetUserId, customMessage, userId: adminUserId },
    "POST"
  );
  return res;
}
