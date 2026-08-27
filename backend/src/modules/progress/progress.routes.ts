import { Router } from "express";
import * as progressController from "./controllers/progress.controller.js";

const router = Router();

router.get("/", progressController.getProgress);

export default router;
