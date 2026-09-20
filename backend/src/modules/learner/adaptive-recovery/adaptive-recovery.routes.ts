import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as controller from "./controllers/adaptive-recovery.controller.js";

const router = Router();

// Unified overview
router.get("/overview", requireAuth, controller.getAdaptiveRecoveryOverview);

// Roadmap Simulator endpoints
router.get("/simulator", requireAuth, controller.getSimulatorData);
router.patch("/pace", requireAuth, controller.updatePace);

// Zero-Guilt Recovery Mode endpoints
router.get("/recovery-status", requireAuth, controller.getRecoveryStatus);
router.post("/start-recovery", requireAuth, controller.startRecovery);
router.post("/complete-step", requireAuth, controller.completeStep);
router.post("/dismiss-recovery", requireAuth, controller.dismissRecovery);

// AI Dependency Meter endpoints
router.get("/ai-dependency", requireAuth, controller.getAiDependency);

export default router;
