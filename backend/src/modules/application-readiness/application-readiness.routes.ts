import { Router } from "express";
import * as applicationreadinessController from "./controllers/application-readiness.controller.js";

const router = Router();

router.get("/", applicationreadinessController.getApplicationReadiness);

export default router;
