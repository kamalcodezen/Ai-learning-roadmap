import cors from "cors";
import express from "express";
import helmet from "helmet";
import env from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { pinoHttp } from "pino-http";
import logger from "./lib/logger.js";

const app = express();

// Security headers
app.use(helmet());

// Allow requests from the configured frontend
app.use(
  cors({
    origin: env.CORS_ORIGIN,
  }),
);

// pino http (console.log)
app.use(pinoHttp({ logger }));

// Parse JSON request bodies
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Learning Roadmap API is healthy",
  });
});

// not found page
app.use(notFoundMiddleware);

// Central error handler —
app.use(errorMiddleware);

export default app;
