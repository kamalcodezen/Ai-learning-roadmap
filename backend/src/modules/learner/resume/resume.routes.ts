import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import {
  getLearnerResume,
  saveLearnerResume,
  generateAutoResume,
  scanResumeATS,
  rewriteBullet,
  matchJob,
} from "./services/resume.service.js";
import { scanUploadedResume } from "./services/resume-ai.service.js";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import { requirePlan } from "../../../middlewares/plan.middleware.js";

const router = Router();

/**
 * GET /api/resume
 * Fetch current user's resume
 */
router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const resume = await getLearnerResume(userId);
    res.json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/resume/save
 * Save / update resume data
 */
router.post("/save", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const resume = await saveLearnerResume(userId, req.body);
    res.json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/resume/generate
 * 1-Click Auto-generate resume from learner's verified skills & projects
 */
router.post("/generate", requireAuth, requirePlan(["PLUS", "PRO"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const result = await generateAutoResume(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/resume/scan
 * Run ATS compatibility scan
 */
router.post("/scan", requireAuth, requirePlan(["PLUS", "PRO"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const { jobDescription } = req.body || {};
    const result = await scanResumeATS(userId, jobDescription);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/resume/rewrite-bullet
 * Magic AI Bullet Point Rewriter
 */
router.post("/rewrite-bullet", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const { rawBullet } = req.body || {};
    if (!rawBullet || typeof rawBullet !== "string") {
      return res.status(400).json({ success: false, message: "rawBullet string is required." });
    }
    const result = await rewriteBullet(userId, rawBullet);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/resume/job-match
 * Match current resume against custom job description
 */
router.post("/job-match", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const { jobDescription } = req.body || {};
    if (!jobDescription || typeof jobDescription !== "string") {
      return res.status(400).json({ success: false, message: "jobDescription string is required." });
    }
    const result = await matchJob(userId, jobDescription);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/resume/upload-scan
 * Instant stateless ATS scan for uploaded resume file (PDF / TXT / DOC)
 * ZERO database writes — 100% in-memory calculation
 */
router.post("/upload-scan", requireAuth, requirePlan(["PLUS", "PRO"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { textContent, base64Pdf, targetRole } = req.body || {};
    if (!textContent && !base64Pdf) {
      return res.status(400).json({
        success: false,
        message: "textContent or base64Pdf is required for resume scan.",
      });
    }
    const result = await scanUploadedResume({ textContent, base64Pdf, targetRole });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
