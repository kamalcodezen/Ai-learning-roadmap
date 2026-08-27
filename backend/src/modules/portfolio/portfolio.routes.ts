import { Router } from "express";
import * as portfolioController from "./controllers/portfolio.controller.js";

const router = Router();

router.get("/", portfolioController.getPortfolio);

export default router;
