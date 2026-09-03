import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { startInterviewSession, submitInterviewAnswer, completeInterviewSession } from "./services/interview.service.js";
import { submitInterviewAnswerSchema } from "./schemas/interview.schema.js";
import { requireAuth } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.post("/start", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const session = await startInterviewSession(userId);
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
});

router.post("/answer", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const validatedData = submitInterviewAnswerSchema.parse(req.body);
    const answer = await submitInterviewAnswer(
      userId,
      validatedData.questionId,
      validatedData.answerText
    );
    res.json({ success: true, data: answer });
  } catch (error) {
    next(error);
  }
});

router.post("/complete", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const result = await completeInterviewSession(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
