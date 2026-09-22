import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as controller from "./controllers/gem-economy.controller.js";

const router = Router();

// Wallet and streak status
router.get("/wallet", requireAuth, controller.getWalletHandler);

// Daily streak gem claim
router.post("/claim-daily", requireAuth, controller.claimDailyHandler);

// Audit history
router.get("/history", requireAuth, controller.getHistoryHandler);

export default router;
