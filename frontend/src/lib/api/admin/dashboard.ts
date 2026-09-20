import { serverFetch } from "../../core/server";

export interface AdminRecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plan?: string;
  createdAt: string;
  careerProfile?: {
    targetRole?: string;
    targetRoleName?: string;
  } | null;
}

export interface AdminRecentActivityItem {
  id: string;
  type: string;
  description: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export interface AdminDashboardOverview {
  overview: {
    totalUsers: number;
    activeLearners: number;
    totalRoadmaps: number;
    totalAssessments: number;
    totalProjects: number;
    totalInterviews?: number;
    totalResumes?: number;
    aiRequests: string | number;
    totalGemsInCirculation?: number;
  };
  userAnalytics: {
    totalUsers: number;
    learners: number;
    admins: number;
    newUsers: number;
    freeUsers?: number;
    plusUsers?: number;
    proUsers?: number;
  };
  roadmapManagement: {
    totalRoadmaps: number;
    active: number;
    completed: number;
  };
  systemHealth: {
    backend: string;
    database: string;
    auth: string;
    ai: string;
  };
  recentUsers: AdminRecentUser[];
  recentActivity: AdminRecentActivityItem[];
}

/**
 * Fetches platform-wide executive summary statistics, user distribution, and health telemetry.
 */
export const getAdminDashboardStats = async (userId: string): Promise<AdminDashboardOverview> => {
  return await serverFetch(`/api/admin/dashboard?userId=${userId}`);
};
