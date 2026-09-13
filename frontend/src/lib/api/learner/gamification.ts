import { serverFetch } from "../../core/server";

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextLevelXp: number;
  currentProgressXp: number;
  progressPercent: number;
}

export interface AchievementItem {
  code: string;
  title: string;
  description: string;
  badgeIcon: string;
  category: string;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface XPTransactionItem {
  id: string;
  amount: number;
  actionType: string;
  description: string;
  createdAt: string;
}

export interface GamificationProfileData {
  totalXp: number;
  levelInfo: LevelInfo;
  achievements: AchievementItem[];
  unlockedCount: number;
  totalAchievementsCount: number;
  recentXpTransactions: XPTransactionItem[];
}

export interface SkillTreeNodeItem {
  id: string;
  name: string;
  category: string;
  status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "MASTERED";
  masteryScore: number;
  knowledgeScore: number;
  practiceScore: number;
  projectScore: number;
  evidenceScore: number;
  isCritical: boolean;
  dependencies: string[];
  unlockedBy: string[];
}

export interface SkillTreeData {
  targetRole: string;
  totalSkills: number;
  masteredCount: number;
  inProgressCount: number;
  availableCount: number;
  lockedCount: number;
  nodes: SkillTreeNodeItem[];
}

export const getGamificationProfile = async (): Promise<GamificationProfileData> => {
  const res = await serverFetch(`/api/gamification/profile`);
  return res?.data || res;
};

export const getSkillTree = async (): Promise<SkillTreeData> => {
  const res = await serverFetch(`/api/gamification/skill-tree`);
  return res?.data || res;
};
