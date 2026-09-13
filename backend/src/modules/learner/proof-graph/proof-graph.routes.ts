import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as proofgraphController from "./controllers/proof-graph.controller.js";

const router = Router();

router.get("/", requireAuth, proofgraphController.getProofGraph);
router.post("/share", requireAuth, proofgraphController.generateShareLink);
router.get("/public/:token", proofgraphController.getPublicProofGraph);

export default router;
