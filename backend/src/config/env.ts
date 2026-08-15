import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  CORS_ORIGIN: z.string().url().default("http://localhost:3000"),
});

const env = envSchema.parse(process.env);

export default env;
