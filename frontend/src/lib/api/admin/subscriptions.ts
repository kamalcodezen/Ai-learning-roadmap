import { serverFetch } from "../../core/server";

export interface PricingTierConfig {
  tier: "FREE" | "PLUS" | "PRO";
  name: string;
  badge: string;
  monthlyPrice: number;
  yearlyPrice: number;
  subscribersCount: number;
  features: string[];
}

export interface AdminSubscriberUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  plan: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  careerProfile?: {
    targetRole?: string;
    targetRoleName?: string;
  } | null;
}

export interface AdminSubscriptionsResponse {
  summary: {
    totalUsers: number;
    totalPaid: number;
    freeCount: number;
    plusCount: number;
    proCount: number;
    mrr: number;
    arr: number;
    conversionRate: string;
  };
  tierConfigs: PricingTierConfig[];
  recentSubscribers: AdminSubscriberUser[];
}

export const getAdminSubscriptions = async (userId: string): Promise<AdminSubscriptionsResponse> => {
  return await serverFetch(`/api/admin/subscriptions?userId=${userId}`);
};
