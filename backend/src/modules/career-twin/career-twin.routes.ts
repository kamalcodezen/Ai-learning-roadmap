import { Router } from "express";
import * as careertwinController from "./controllers/career-twin.controller.js";

const router = Router();

router.get("/", careertwinController.getCareerTwin);

export default router;
