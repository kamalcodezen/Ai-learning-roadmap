export type GemSourceType =
  | "DAILY_STREAK"
  | "MILESTONE_COMPLETED"
  | "INTERVIEW_PASSED"
  | "PROJECT_VERIFIED"
  | "RECOVERY_COMPLETED"
  | "DIAGNOSTIC_COMPLETED"
  | "ASSESSMENT_COMPLETED"
  | "LEVEL_UP"
  | "WELCOME_BONUS";

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

export interface AwardGemsResult {
  awarded: boolean;
  awardedAmount: number;
  gemsBalance: number;
  source: string;
  description: string;
}
