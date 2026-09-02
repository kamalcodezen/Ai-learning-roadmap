import { z } from "zod";

export const CreateProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
  repositoryUrl: z.union([z.string().url("Must be a valid URL"), z.string().length(0)]).optional().transform(e => e === "" ? undefined : e),
  liveUrl: z.union([z.string().url("Must be a valid URL"), z.string().length(0)]).optional().transform(e => e === "" ? undefined : e),
  techStack: z.array(z.string()).default([]),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();
