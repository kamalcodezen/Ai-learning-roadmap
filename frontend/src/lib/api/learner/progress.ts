import { serverFetch } from "../../core/server";

export interface ActivityItem {
  id: string;
  type: "learning" | "assessment" | "project";
  category?: "Diagnostic" | "Simulation" | "Interview" | "Milestone" | "Project" | "Activity";
  title: string;
  date: string;
  formattedDate?: string;
  description: string;
  score?: number | null;
  estimatedMinutes?: number;
}

export interface SkillProgressItem {
  name: string;
  score: number;
  knowledge: number;
  practice: number;
  project: number;
  level: string;
}

export interface ProgressSummary {
  completedMilestones: number;
  totalMilestones: number;
  completedProjects: number;
  completedAssessments: number;
  completedInterviews: number;
  totalXp: number;
  targetRole: string;
}

export interface ProgressData {
  weeklyHours: number;
  monthlyHours: number;
  totalHours?: number;
  currentStreak: number;
  readinessTrend: number;
  targetRole?: string;
  summary?: ProgressSummary;
  skills?: SkillProgressItem[];
  recentActivity: ActivityItem[];
}

/**
 * Retrieves the Progress analytics data.
 */
export const getProgress = async (): Promise<ProgressData> => {
  return await serverFetch(`/api/progress`);
};
