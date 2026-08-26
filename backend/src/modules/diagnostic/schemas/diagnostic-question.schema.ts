import { z } from "zod";

export const diagnosticQuestionsQuerySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  category: z.string().trim().min(1).optional(),
  skill: z.string().trim().min(1).optional(),
  difficulty: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

export type DiagnosticQuestionsQuery = z.infer<
  typeof diagnosticQuestionsQuerySchema
>;
