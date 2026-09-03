import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as portfolioController from "./controllers/portfolio.controller.js";

const router = Router();

router.get("/", requireAuth, portfolioController.getPortfolio);
router.get("/projects/:id", requireAuth, portfolioController.getProject);
router.post("/projects", requireAuth, portfolioController.createProject);
router.put("/projects/:id", requireAuth, portfolioController.updateProject);
router.delete("/projects/:id", requireAuth, portfolioController.deleteProject);

router.post("/projects/:id/review", requireAuth, portfolioController.generateProjectReview);
router.get("/projects/:id/review", requireAuth, portfolioController.getProjectReview);
router.post("/projects/:id/verify", requireAuth, portfolioController.verifyProject);

export default router;
