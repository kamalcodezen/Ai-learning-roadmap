import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";

import { createOrUpdateCareerProfile, getRoutingState } from "./controllers/career-profile.controller.js";

const router = Router();

router.post("/", requireAuth, createOrUpdateCareerProfile);
router.get("/routing-state", requireAuth, getRoutingState);

export default router;
