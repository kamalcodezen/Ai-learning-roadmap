import { Router } from "express";
import * as learningPathController from "./controllers/learning-path.controller.js";

const router = Router();

// Endpoint: /api/learning-path?userId=${userId}
router.get("/", learningPathController.getLearningPath);

export default router;
