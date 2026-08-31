import cors from "cors";
import express from "express";
import helmet from "helmet";
import env from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { pinoHttp } from "pino-http";
import logger from "./lib/logger.js";
import chatRoutes from "./modules/learner/copilot/chat.routes.js";
import careerProfileRoutes from "./modules/learner/profile/career-profile.routes.js";
import diagnosticRoutes from "./modules/learner/diagnostic/diagnostic.routes.js";
import dashboardRoutes from "./modules/learner/dashboard/dashboard.routes.js";
import learningPathRoutes from "./modules/learner/roadmap/learning-path.routes.js";
import careertwinRoutes from "./modules/learner/career-twin/career-twin.routes.js";
import skillgapsRoutes from "./modules/learner/skill-gaps/skill-gaps.routes.js";
import progressRoutes from "./modules/learner/progress/progress.routes.js";
import proofgraphRoutes from "./modules/learner/proof-graph/proof-graph.routes.js";
import assessmentsRoutes from "./modules/learner/assessments/assessments.routes.js";
import careeralignmentRoutes from "./modules/learner/career-alignment/career-alignment.routes.js";
import applicationreadinessRoutes from "./modules/learner/application-readiness/application-readiness.routes.js";
import portfolioRoutes from "./modules/learner/projects/portfolio.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
const isProduction = env.NODE_ENV === "production";

const app = express();

// Security headers
app.use(helmet());

// Allow requests from the configured frontend
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
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

// Learning Path Routes
app.use("/api/learning-path", learningPathRoutes);

// Extracted Features
app.use("/api/career-twin", careertwinRoutes);
app.use("/api/skill-gaps", skillgapsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/proof-graph", proofgraphRoutes);
app.use("/api/assessments", assessmentsRoutes);
app.use("/api/career-alignment", careeralignmentRoutes);
app.use("/api/application-readiness", applicationreadinessRoutes);

// Portfolio Routes
app.use("/api/portfolio", portfolioRoutes);

// Career Profile Routes/ onboarding
app.use("/api/career-profile", careerProfileRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

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
