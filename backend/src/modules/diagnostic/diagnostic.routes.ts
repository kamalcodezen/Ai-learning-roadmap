import { Router } from "express";

import { getDiagnosticQuestionsController } from "./controllers/diagnostic-question.controller.js";

import {
  createDiagnosticAttemptController,
  completeDiagnosticAttemptController,
} from "./controllers/diagnostic-attempt.controller.js";

import { submitDiagnosticAnswerController } from "./controllers/diagnostic-answer.controller.js";

const diagnosticRoutes = Router();

// ============================================================
// GET DIAGNOSTIC QUESTIONS
// GET /api/diagnostic/questions
// ============================================================

diagnosticRoutes.get("/questions", getDiagnosticQuestionsController);

// ============================================================
// CREATE DIAGNOSTIC ATTEMPT
// POST /api/diagnostic/attempts
// ============================================================

diagnosticRoutes.post("/attempts", createDiagnosticAttemptController);

// ============================================================
// SUBMIT DIAGNOSTIC ANSWER
// POST /api/diagnostic/attempts/:attemptId/answers
// ============================================================

diagnosticRoutes.post(
  "/attempts/:attemptId/answers",
  submitDiagnosticAnswerController,
);

// ============================================================
// COMPLETE DIAGNOSTIC ATTEMPT
// POST /api/diagnostic/attempts/:attemptId/complete
// ============================================================

diagnosticRoutes.post(
  "/attempts/:attemptId/complete",
  completeDiagnosticAttemptController,
);

export default diagnosticRoutes;
