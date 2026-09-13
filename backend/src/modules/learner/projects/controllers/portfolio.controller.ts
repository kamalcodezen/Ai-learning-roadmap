import type { Request, Response, NextFunction } from "express";
import * as portfolioService from "../services/portfolio.service.js";
import { CreateProjectSchema, ImportProjectSchema, UpdateProjectSchema } from "../schemas/project.schema.js";

const getUserId = (req: Request) => {
  const userId = req.userId as string;
  if (!userId) throw new Error("userId is required.");
  return userId;
};

export const getPortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await portfolioService.getPortfolio(getUserId(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const project = await portfolioService.getProject(userId, id);
    res.json(project);
  } catch (error: any) {
    if (error.message === "Project not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error in getProject:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

export const generateProjectReview = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const review = await portfolioService.generateProjectReview(userId, id);
    res.json(review);
  } catch (error: any) {
    if (error.message === "Project not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error in generateProjectReview:", error);
    res.status(500).json({ error: error.message || "Failed to generate project review" });
  }
};

export const getProjectReview = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const review = await portfolioService.getProjectReview(userId, id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(review);
  } catch (error: any) {
    if (error.message === "Project not found") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error in getProjectReview:", error);
    res.status(500).json({ error: "Failed to fetch project review" });
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validData = CreateProjectSchema.parse(req.body);
    const data = await portfolioService.createProject(getUserId(req), validData);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const importProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validData = ImportProjectSchema.parse(req.body);
    const payload: {
      repositoryUrl: string;
      liveUrl?: string;
      title?: string;
      description?: string;
      techStack?: string[];
    } = {
      repositoryUrl: validData.repositoryUrl,
    };
    if (validData.liveUrl) payload.liveUrl = validData.liveUrl;
    if (validData.title) payload.title = validData.title;
    if (validData.description) payload.description = validData.description;
    if (validData.techStack) payload.techStack = validData.techStack;

    const data = await portfolioService.importExistingProject(getUserId(req), payload);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const reanalyzeProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const projectId = req.params.id as string;
    const data = await portfolioService.reanalyzeProject(userId, projectId);
    res.json({ success: true, data });
  } catch (error: any) {
    if (error.message === "Project not found") {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validData = UpdateProjectSchema.parse(req.body);
    const data = await portfolioService.updateProject(getUserId(req), req.params.id as string, validData);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await portfolioService.deleteProject(getUserId(req), req.params.id as string);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const verifyProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const projectId = req.params.id as string;
    const data = await portfolioService.verifyProjectUrls(userId, projectId);
    res.json({ success: true, data });
  } catch (error: any) {
    if (error.message === "Project not found") {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

export const generateMilestoneProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const milestoneId = (req.params.milestoneId || req.body?.milestoneId || req.query.milestoneId) as string | undefined;
    const skill = (req.body?.skill || req.query.skill) as string | undefined;
    const result = await portfolioService.generateMilestoneProject(getUserId(req), milestoneId || null, skill || null);
    res.status(result.duplicate ? 200 : 201).json({
      success: true,
      data: result.project,
      created: result.created,
      duplicate: result.duplicate,
      project: result.project,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewProjectPullRequest = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const projectId = req.params.id as string;
    const { prUrl } = req.body;
    if (!prUrl || typeof prUrl !== "string") {
      return res.status(400).json({ error: "prUrl is required" });
    }
    const data = await portfolioService.reviewProjectPullRequest(userId, projectId, prUrl);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to review pull request" });
  }
};

