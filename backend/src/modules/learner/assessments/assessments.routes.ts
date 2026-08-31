import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as assessmentsController from "./controllers/assessments.controller.js";

const router = Router();

router.get("/", requireAuth, assessmentsController.getAssessments);

export default router;
