import { Router } from "express";
import * as assessmentsController from "./controllers/assessments.controller.js";

const router = Router();

router.get("/", assessmentsController.getAssessments);

export default router;
