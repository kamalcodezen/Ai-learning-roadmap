import { Router } from "express";
import * as skillgapsController from "./controllers/skill-gaps.controller.js";

const router = Router();

router.get("/", skillgapsController.getSkillGaps);

export default router;
