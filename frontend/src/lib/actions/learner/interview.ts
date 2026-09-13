import { serverFetch, serverMutation } from "../../core/server";

export const startInterview = async () => {
  return serverMutation("/api/interview/start", {});
};

export const submitInterviewAnswer = async (data: { questionId: string; answerText: string }) => {
  return serverMutation("/api/interview/answer", data);
};

export const completeInterview = async () => {
  return serverMutation("/api/interview/complete", {});
};

export const getInterviewHistory = async () => {
  return serverFetch("/api/interview/history");
};

export const getInterviewSession = async (sessionId: string) => {
  return serverFetch(`/api/interview/session/${sessionId}`);
};
