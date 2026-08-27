import { Router } from "express";
import * as dashboardController from "./controllers/dashboard.controller.js";

const router = Router();

// Ensure the endpoints match what frontend expects
// Frontend: fetch(`/api/dashboard?userId=${userId}`)
router.get("/dashboard", dashboardController.getOverview);



export default router;

