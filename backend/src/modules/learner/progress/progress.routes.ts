import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as progressController from "./controllers/progress.controller.js";

const router = Router();

router.get("/", requireAuth, progressController.getProgress);

export default router;
