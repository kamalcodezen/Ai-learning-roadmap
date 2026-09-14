import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ChatController } from "./controllers/chat.controller.js";
import { optionalAuth } from "../../../middlewares/auth.middleware.js";

const router = Router();


// Express rate limit: maximum 100 requests per minute
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many chat requests. Please try again later.",
  },
});

router.post("/", chatRateLimiter, optionalAuth, ChatController.processChat);
router.get("/history", optionalAuth, ChatController.getChatHistory);

export default router;
