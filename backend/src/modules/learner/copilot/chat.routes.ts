import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ChatController } from "./controllers/chat.controller.js";
import { optionalAuth } from "../../../middlewares/auth.middleware.js";

const router = Router();


// express-rate-limit প্রতি মিনিটে সর্বোচ্চ ১০০টি রিকোয়েস্টের সাপোর্ট
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

export default router;
