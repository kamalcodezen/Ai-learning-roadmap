import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as applicationreadinessController from "./controllers/application-readiness.controller.js";

const router = Router();

router.get("/", requireAuth, applicationreadinessController.getApplicationReadiness);

export default router;
