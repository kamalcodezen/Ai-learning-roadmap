import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import * as jobRealityController from "./job-reality.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", jobRealityController.getLearnerJobReality);

export default router;
