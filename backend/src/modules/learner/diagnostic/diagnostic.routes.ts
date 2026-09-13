import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";

import { getDiagnosticQuestionsController } from "./controllers/diagnostic-question.controller.js";

import {
  createDiagnosticAttemptController,
  completeDiagnosticAttemptController,
  getDiagnosticResultController,
  getLatestDiagnosticResultController,
} from "./controllers/diagnostic-attempt.controller.js";

import { submitDiagnosticAnswerController } from "./controllers/diagnostic-answer.controller.js";

const diagnosticRoutes = Router();

// ============================================================
// GET DIAGNOSTIC QUESTIONS
// GET /api/diagnostic/questions
// ============================================================

diagnosticRoutes.get("/questions", requireAuth, getDiagnosticQuestionsController);

// ============================================================
// CREATE DIAGNOSTIC ATTEMPT
// POST /api/diagnostic/attempts
// ============================================================

diagnosticRoutes.post("/attempts", requireAuth, createDiagnosticAttemptController);

// ============================================================
// GET LATEST COMPLETED DIAGNOSTIC RESULT
// GET /api/diagnostic/attempts/latest/result
// ============================================================

diagnosticRoutes.get(
  "/attempts/latest/result",
  requireAuth,
  getLatestDiagnosticResultController,
);

// ============================================================
// GET DIAGNOSTIC RESULT BY ATTEMPT ID
// GET /api/diagnostic/attempts/:attemptId/result
// ============================================================

diagnosticRoutes.get(
  "/attempts/:attemptId/result",
  requireAuth,
  getDiagnosticResultController,
);

// ============================================================
// SUBMIT DIAGNOSTIC ANSWER
// POST /api/diagnostic/attempts/:attemptId/answers
// ============================================================

diagnosticRoutes.post(
  "/attempts/:attemptId/answers",
  requireAuth,
  submitDiagnosticAnswerController,
);

// ============================================================
// COMPLETE DIAGNOSTIC ATTEMPT
// POST /api/diagnostic/attempts/:attemptId/complete
// ============================================================

diagnosticRoutes.post(
  "/attempts/:attemptId/complete",
  requireAuth,
  completeDiagnosticAttemptController,
);

export default diagnosticRoutes;

