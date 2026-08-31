import { z } from "zod";

export const submitDiagnosticAnswerSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  selectedAnswer: z.string().min(1, "Selected answer is required"),
});

export type SubmitDiagnosticAnswerInput = z.infer<
  typeof submitDiagnosticAnswerSchema
>;
