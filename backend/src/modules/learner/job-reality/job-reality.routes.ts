import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import { requirePlan } from "../../../middlewares/plan.middleware.js";
import * as jobRealityController from "./job-reality.controller.js";

const router = Router();

// Requires authentication and paid plan (PLUS or PRO)
router.use(requireAuth);
router.use(requirePlan(["PLUS", "PRO"]));

router.get("/", jobRealityController.getLearnerJobReality);

export default router;
