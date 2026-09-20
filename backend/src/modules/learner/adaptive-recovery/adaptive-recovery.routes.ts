import { Router } from "express";
import * as controller from "./controllers/adaptive-recovery.controller.js";

const router = Router();

router.get("/simulate", controller.simulatePace);
router.post("/save-pace", controller.savePace);
router.get("/recovery-plan", controller.getRecoveryPlan);
router.post("/claim-bonus", controller.claimBonus);
router.get("/ai-dependency", controller.getAIDependency);

export default router;
