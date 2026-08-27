import { Router } from "express";
import * as careeralignmentController from "./controllers/career-alignment.controller.js";

const router = Router();

router.get("/", careeralignmentController.getCareerAlignment);

export default router;
