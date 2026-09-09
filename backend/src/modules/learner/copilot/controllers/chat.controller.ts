import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../../../../lib/prisma.js";
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

      if (req.userId) {
        const backendContext = await ChatService.fetchUserContext(req.userId, validatedData.message);
        if (backendContext) {
          finalContext = backendContext;
        }
      }

      const result = await ChatService.processChat(
        validatedData.message,
        sanitizedHistory,
        finalContext,
      );

      // Persist to ActivityLog asynchronously without blocking the user response
      if (req.userId) {
        prisma.activityLog
          .create({
            data: {
              userId: req.userId,
              type: "COPILOT_CHAT",
              description: validatedData.message.slice(0, 100),
              metadata: {
                userMessage: validatedData.message,
                assistantReply: result.reply,
                provider: result.provider,
                model: result.model,
              },
            },
          })
          .catch((err) => console.error("Error logging chat conversation:", err));
      }

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

  static async getChatHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(200).json({ success: true, data: [] });
      }

      const logs = await prisma.activityLog.findMany({
        where: {
          userId,
          type: "COPILOT_CHAT",
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      const messages = logs.reverse().flatMap((log) => {
        const meta = (log.metadata as Record<string, any>) || {};
        const pairs: Array<{ role: "user" | "assistant"; content: string; createdAt: string }> = [];
        if (meta.userMessage) {
          pairs.push({ role: "user", content: meta.userMessage, createdAt: log.createdAt.toISOString() });
        }
        if (meta.assistantReply) {
          pairs.push({ role: "assistant", content: meta.assistantReply, createdAt: log.createdAt.toISOString() });
        }
        return pairs;
      });

      return res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      return next(error);
    }
  }
}
