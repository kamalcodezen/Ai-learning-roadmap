import { Router } from "express";
import * as dashboardController from "./controllers/dashboard.controller.js";

const router = Router();

// Ensure the endpoints match what frontend expects
// Frontend: fetch(`/api/dashboard?userId=${userId}`)
router.get("/dashboard", dashboardController.getOverview);

// Frontend: fetch(`/api/learning-path?userId=${userId}`)
router.get("/learning-path", dashboardController.getLearningPath);

router.get("/career-twin", dashboardController.getCareerTwin);
router.get("/skill-gaps", dashboardController.getSkillGaps);
router.get("/progress", dashboardController.getProgress);
router.get("/proof-graph", dashboardController.getProofGraph);
router.get("/assessments", dashboardController.getAssessments);
router.get("/career-alignment", dashboardController.getCareerAlignment);
router.get("/application-readiness", dashboardController.getApplicationReadiness);
router.get("/portfolio", dashboardController.getPortfolio);

export default router;
