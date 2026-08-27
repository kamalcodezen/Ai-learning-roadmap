import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ChatService } from "../services/chat.service.js";

const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(12000, "Message is too long"),

  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().default(""),
      }),
    )
    .optional()
    .default([]),

  context: z.string().trim().max(6000).optional(),
  userId: z.string().optional(),
});

export class ChatController {
  static async processChat(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = chatRequestSchema.parse(req.body);

      // Zod পার্সিংয়ের পর শেষ ৪টি মেসেজ ফিল্টার করে পাঠানো হচ্ছে
      const sanitizedHistory = validatedData.history
        .filter((item) => item.content.trim().length > 0)
        .slice(-4);

      let finalContext = validatedData.context;

      if (validatedData.userId) {
        const backendContext = await ChatService.fetchUserContext(validatedData.userId, validatedData.message);
        if (backendContext) {
          finalContext = backendContext;
        }
      }

      const result = await ChatService.processChat(
        validatedData.message,
        sanitizedHistory,
        finalContext,
      );

      return res.status(200).json({
        success: true,
        data: {
          reply: result.reply,
          provider: result.provider,
          model: result.model,
          complexity: result.complexity,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}
