import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";

import { createOrUpdateCareerProfile, getRoutingState } from "./controllers/career-profile.controller.js";
import { fetchCareerAnalysis, triggerCareerAnalysis } from "./controllers/career-analysis.controller.js";

const router = Router();

router.post("/", requireAuth, createOrUpdateCareerProfile);
router.get("/routing-state", requireAuth, getRoutingState);

// Career Goal Analysis
router.get("/analyze", requireAuth, fetchCareerAnalysis);
router.post("/analyze", requireAuth, triggerCareerAnalysis);

export default router;
