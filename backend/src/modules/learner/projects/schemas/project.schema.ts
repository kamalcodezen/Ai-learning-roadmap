import { z } from "zod";

export const CreateProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
  repositoryUrl: z.union([z.string().url("Must be a valid URL"), z.string().length(0)]).optional().transform(e => e === "" ? undefined : e),
  liveUrl: z.union([z.string().url("Must be a valid URL"), z.string().length(0)]).optional().transform(e => e === "" ? undefined : e),
  techStack: z.array(z.string()).default([]),
  projectType: z.enum(["GENERATED", "IMPORTED"]).optional().default("GENERATED"),
});

export const ImportProjectSchema = z.object({
  repositoryUrl: z.string().min(1, "GitHub repository URL is required").url("Must be a valid GitHub URL"),
  liveUrl: z.union([z.string().url("Must be a valid URL"), z.string().length(0)]).optional().transform(e => e === "" ? undefined : e),
  title: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  techStack: z.array(z.string()).optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

