import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as skillgapsController from "./controllers/skill-gaps.controller.js";

const router = Router();

router.get("/", requireAuth, skillgapsController.getSkillGaps);

export default router;
