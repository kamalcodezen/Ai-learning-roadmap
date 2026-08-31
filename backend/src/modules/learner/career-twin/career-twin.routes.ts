import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as careertwinController from "./controllers/career-twin.controller.js";

const router = Router();

router.get("/", requireAuth, careertwinController.getCareerTwin);

export default router;
