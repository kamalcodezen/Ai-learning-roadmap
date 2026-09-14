import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import { requirePlan } from "../../../middlewares/plan.middleware.js";
import * as assessmentsController from "./controllers/assessments.controller.js";

const router = Router();

// Overview assessment is free for all learners
router.get("/", requireAuth, assessmentsController.getAssessments);

// AI coding simulation requires PLUS or PRO plan
router.get("/simulation", requireAuth, requirePlan(["PLUS", "PRO"]), assessmentsController.getSkillSimulation);
router.post("/simulation/submit", requireAuth, requirePlan(["PLUS", "PRO"]), assessmentsController.submitSkillSimulation);
router.get("/simulation/result", requireAuth, requirePlan(["PLUS", "PRO"]), assessmentsController.getSkillSimulationResult);

export default router;
