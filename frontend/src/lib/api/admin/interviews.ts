import { serverFetch } from "../../core/server";

export interface AdminInterviewSessionItem {
  id: string;
  userId: string;
  targetRole?: string | null;
  status: "IN_PROGRESS" | "COMPLETED";
  score?: number | null;
  startedAt: string;
  completedAt?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    plan: string;
  };
  _count: {
    questions: number;
    answers: number;
  };
}

export interface AdminInterviewDetails extends AdminInterviewSessionItem {
  questions: {
    id: string;
    question: string;
    order: number;
  }[];
  answers: {
    id: string;
    questionId: string;
    answerText: string;
    evaluation?: {
      score?: number;
      feedback?: string;
      strengths?: string[];
      improvements?: string[];
    } | null;
    question?: {
      id: string;
      question: string;
    };
  }[];
}

export interface AdminInterviewsResponse {
  interviews: AdminInterviewSessionItem[];
  total: number;
  summary: {
    totalSessions: number;
    completedSessions: number;
    inProgressSessions: number;
    averageScore: number;
  };
}

export const getAdminInterviews = async (
  userId: string,
  skip = 0,
  take = 20,
  search = "",
  status = "",
  days?: number
): Promise<AdminInterviewsResponse> => {
  let url = `/api/admin/interviews?userId=${userId}&skip=${skip}&take=${take}&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${status}`;
  if (days) url += `&days=${days}`;
  return await serverFetch(url);
};

export const getAdminInterviewDetails = async (
  userId: string,
  sessionId: string
): Promise<AdminInterviewDetails> => {
  return await serverFetch(`/api/admin/interviews/${sessionId}?userId=${userId}`);
};
