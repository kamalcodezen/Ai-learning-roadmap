import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import { requirePlan } from "../../../middlewares/plan.middleware.js";
import * as proofgraphController from "./controllers/proof-graph.controller.js";

const router = Router();

router.get("/", requireAuth, proofgraphController.getProofGraph);

// Verified shareable link generation requires PRO plan
router.post("/share", requireAuth, requirePlan(["PRO"]), proofgraphController.generateShareLink);

router.get("/public/:token", proofgraphController.getPublicProofGraph);

export default router;
