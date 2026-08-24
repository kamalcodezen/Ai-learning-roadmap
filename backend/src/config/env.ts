import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  CORS_ORIGIN: z.string().url().default("http://localhost:3000"),

  DATABASE_URL: z.string().url(),

  GROQ_API_KEY: z.string().default(""),

  OPENROUTER_API_KEY: z.string().default(""),

  GEMINI_API_KEY: z.string().default(""),

  MISTRAL_API_KEY: z.string().default(""),
});

const env = envSchema.parse(process.env);

export default env;
