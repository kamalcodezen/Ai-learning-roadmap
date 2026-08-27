import { Router } from "express";
import * as proofgraphController from "./controllers/proof-graph.controller.js";

const router = Router();

router.get("/", proofgraphController.getProofGraph);

export default router;
