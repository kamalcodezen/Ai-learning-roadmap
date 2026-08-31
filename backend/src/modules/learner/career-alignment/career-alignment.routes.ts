import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as careeralignmentController from "./controllers/career-alignment.controller.js";

const router = Router();

router.get("/", requireAuth, careeralignmentController.getCareerAlignment);

export default router;
