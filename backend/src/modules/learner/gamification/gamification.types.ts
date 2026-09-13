export type XPActionType =
  | "ASSESSMENT_COMPLETION"
  | "MILESTONE_COMPLETION"
  | "PROJECT_COMPLETION"
  | "EVIDENCE_VERIFIED"
  | "INTERVIEW_COMPLETION"
  | "ACHIEVEMENT_UNLOCKED";

export interface AchievementDefinition {
  code: string;
  title: string;
  description: string;
  badgeIcon: string;
  category: "ONBOARDING" | "SKILL" | "PROJECT" | "ASSESSMENT" | "CAREER";
  xpReward: number;
}

export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  {
    code: "FIRST_DIAGNOSTIC",
    title: "Diagnostic Pioneer",
    description: "Complete your first role diagnostic assessment.",
    badgeIcon: "BrainCircuit",
    category: "ASSESSMENT",
    xpReward: 100,
  },
  {
    code: "FIRST_MILESTONE",
    title: "Milestone Crusher",
    description: "Complete your first learning roadmap milestone.",
    badgeIcon: "Flag",
    category: "SKILL",
    xpReward: 100,
  },
  {
    code: "FIRST_PROJECT",
    title: "Builder Born",
    description: "Build and complete a portfolio project.",
    badgeIcon: "FolderGit2",
    category: "PROJECT",
    xpReward: 150,
  },
  {
    code: "FIRST_VERIFIED_EVIDENCE",
    title: "Proof of Competence",
    description: "Earn verified proof or repository verification for a skill.",
    badgeIcon: "ShieldCheck",
    category: "PROJECT",
    xpReward: 100,
  },
  {
    code: "FIRST_INTERVIEW",
    title: "Interview Ready",
    description: "Complete your first technical mock interview session.",
    badgeIcon: "Users",
    category: "CAREER",
    xpReward: 150,
  },
  {
    code: "SKILL_APPRENTICE",
    title: "Skill Apprentice",
    description: "Attain 70%+ knowledge score in at least 1 core skill.",
    badgeIcon: "Sparkles",
    category: "SKILL",
    xpReward: 100,
  },
  {
    code: "SKILL_MASTER",
    title: "Skill Master",
    description: "Achieve 80%+ composite mastery in at least 3 skills.",
    badgeIcon: "Trophy",
    category: "SKILL",
    xpReward: 250,
  },
  {
    code: "CAREER_READY",
    title: "Industry Qualified",
    description: "Achieve an overall career readiness benchmark score of 75%+.",
    badgeIcon: "Award",
    category: "CAREER",
    xpReward: 300,
  },
];

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextLevelXp: number;
  currentProgressXp: number;
  progressPercent: number;
}

export const LEVEL_TIERS: { level: number; title: string; minXp: number }[] = [
  { level: 1, title: "Novice Pather", minXp: 0 },
  { level: 2, title: "Code Explorer", minXp: 100 },
  { level: 3, title: "Skill Practitioner", minXp: 250 },
  { level: 4, title: "Competent Builder", minXp: 500 },
  { level: 5, title: "Domain Specialist", minXp: 1000 },
  { level: 6, title: "Senior Craftsman", minXp: 2000 },
  { level: 7, title: "Lead Architect", minXp: 3500 },
  { level: 8, title: "Principal Legend", minXp: 5000 },
];

export type SkillTreeNodeStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "MASTERED";

export interface SkillTreeNode {
  id: string;
  name: string;
  category: string;
  status: SkillTreeNodeStatus;
  masteryScore: number;
  knowledgeScore: number;
  practiceScore: number;
  projectScore: number;
  evidenceScore: number;
  isCritical: boolean;
  dependencies: string[];
  unlockedBy: string[];
}
