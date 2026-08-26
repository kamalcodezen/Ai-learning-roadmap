import { z } from "zod";

export const createDiagnosticAttemptSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type CreateDiagnosticAttemptInput = z.infer<
  typeof createDiagnosticAttemptSchema
>;
