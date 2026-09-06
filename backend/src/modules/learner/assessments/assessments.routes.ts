import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as assessmentsController from "./controllers/assessments.controller.js";

const router = Router();

router.get("/", requireAuth, assessmentsController.getAssessments);
router.get("/simulation", requireAuth, assessmentsController.getSkillSimulation);
router.post("/simulation/submit", requireAuth, assessmentsController.submitSkillSimulation);
router.get("/simulation/result", requireAuth, assessmentsController.getSkillSimulationResult);

export default router;
