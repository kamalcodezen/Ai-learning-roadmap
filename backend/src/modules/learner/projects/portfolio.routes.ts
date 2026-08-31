import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as portfolioController from "./controllers/portfolio.controller.js";

const router = Router();

router.get("/", requireAuth, portfolioController.getPortfolio);

export default router;
