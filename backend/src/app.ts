import cors from "cors";
import express from "express";
import helmet from "helmet";
import env from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { pinoHttp } from "pino-http";
import logger from "./lib/logger.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import careerProfileRoutes from "./modules/career-profile/career-profile.routes.js";
import diagnosticRoutes from "./modules/diagnostic/diagnostic.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";

const isProduction = env.NODE_ENV === "production";

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
app.use(
  pinoHttp({
    logger, // লোকালে সাধারণ রিকোয়েস্ট লগ বন্ধ থাকবে, প্রোডাকশনে অন থাকবে
    autoLogging: isProduction,
    // কোনো এরর (400, 500 বা Prisma Crash) হলে লোকালেও সাথে সাথে দেখাবে
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 400 || err) return "error";
      return "info";
    },
  }),
);

// Parse JSON request bodies
app.use(express.json());

// API Chat Routes
app.use("/api/chat", chatRoutes);

// Diagnostic Routes (question)
app.use("/api/diagnostic", diagnosticRoutes);

// Dashboard and API endpoints
app.use("/api", dashboardRoutes);

// Career Profile Routes/ onboarding
app.use("/api/career-profile", careerProfileRoutes);

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
