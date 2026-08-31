import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as learningPathController from "./controllers/learning-path.controller.js";

const router = Router();

// Endpoint: /api/learning-path?userId=${userId}
router.get("/", requireAuth, learningPathController.getLearningPath);

export default router;
