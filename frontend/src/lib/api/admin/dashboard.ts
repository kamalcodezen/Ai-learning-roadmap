import { serverFetch } from "../../core/server";

export interface AdminRecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
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
    aiRequests: string | number;
  };
  userAnalytics: {
    totalUsers: number;
    learners: number;
    admins: number;
    newUsers: number;
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
