import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as learningPathController from "./controllers/learning-path.controller.js";

const router = Router();

// Endpoint: /api/learning-path?userId=${userId}
router.get("/", requireAuth, learningPathController.getLearningPath);

// Endpoint: /api/learning-path/:milestoneId/complete?userId=${userId}
router.post("/:milestoneId/complete", requireAuth, learningPathController.completeMilestone);

// Endpoint: /api/learning-path/milestones/:milestoneId/resources
router.get("/milestones/:milestoneId/resources", requireAuth, learningPathController.getCuratedResources);

// Endpoint: /api/learning-path/adaptive-decision
router.get("/adaptive-decision", requireAuth, learningPathController.getAdaptiveDecision);

export default router;
