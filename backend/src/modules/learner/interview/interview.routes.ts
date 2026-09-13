import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { 
  startInterviewSession, 
  submitInterviewAnswer, 
  completeInterviewSession,
  getInterviewHistory,
  getInterviewSessionDetails
} from "./services/interview.service.js";
import { submitInterviewAnswerSchema } from "./schemas/interview.schema.js";
import { requireAuth } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/history", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const history = await getInterviewHistory(userId);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

router.get("/session/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const sessionId = (req.params.id as string) || "";
    const session = await getInterviewSessionDetails(userId, sessionId);
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
});

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
