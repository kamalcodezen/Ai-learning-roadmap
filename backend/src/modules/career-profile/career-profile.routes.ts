import { Router } from "express";

import { createOrUpdateCareerProfile } from "./career-profile.controller.js";

const router = Router();

router.post("/", createOrUpdateCareerProfile);

export default router;
