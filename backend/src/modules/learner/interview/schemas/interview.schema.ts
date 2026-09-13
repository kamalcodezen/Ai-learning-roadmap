import { z } from "zod";

export const startInterviewSchema = z.object({}); // Empty for now, but good for future expansion

export const submitInterviewAnswerSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  answerText: z.string().min(1, "Answer text is required"),
});

export const completeInterviewSchema = z.object({});

export type StartInterviewInput = z.infer<typeof startInterviewSchema>;
export type SubmitInterviewAnswerInput = z.infer<typeof submitInterviewAnswerSchema>;
export type CompleteInterviewInput = z.infer<typeof completeInterviewSchema>;
