import { z } from "zod";

export const careerProfileSchema = z.object({
  userId: z.string().min(1, "User ID is required"),

  targetRole: z.string().min(1, "Target role is required"),

  targetRoleName: z.string().min(1, "Target role name is required"),

  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE"]),
});

export type CareerProfileInput = z.infer<typeof careerProfileSchema>;
