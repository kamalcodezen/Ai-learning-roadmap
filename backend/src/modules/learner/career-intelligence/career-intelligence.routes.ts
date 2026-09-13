import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import {
  getCareerDecisionController,
  getEvidenceVerificationController,
} from "./controllers/career-intelligence.controller.js";

const router = Router();

router.get("/decision", requireAuth, getCareerDecisionController);
router.get("/evidence-verification", requireAuth, getEvidenceVerificationController);

export default router;
