import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import {
  getGamificationProfileController,
  getSkillTreeController,
  syncAchievementsController,
} from "./controllers/gamification.controller.js";

const router = Router();

// GET /api/gamification/profile
router.get("/profile", requireAuth, getGamificationProfileController);

// GET /api/gamification/skill-tree
router.get("/skill-tree", requireAuth, getSkillTreeController);

// POST /api/gamification/sync-achievements
router.post("/sync-achievements", requireAuth, syncAchievementsController);

export default router;
